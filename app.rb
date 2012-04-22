require 'rubygems'
require 'sinatra'
require 'json/pure'
require 'mongo'
include Mongo

db = Connection.new("172.16.3.30").db('test')

###############################################################################################################
##################################### API ... #################################################################
###############################################################################################################

get '/api/planets/search' do

	collection = db.collection('planets')

	opts = get_find_opts(params)
	
	# process the parameters into something we can use for search (we would like to enable ranges here)
	sort = get_sort_opts(params)

	search_p = {}
	params.keys.each do |p|
		if(p != "fields" && p != "sort" && p != "limit" && p != "start") 
			# look at the key and see if it contains a range symbol
			if(p.split(":").count == 1)
				search_p[p] = params[p]
			else
				# split the operator and field name
				parts = p.split(":")
				field = parts[0]
				operator = parts[1]

				search_p[field] = {"$" + operator => params[p]}
			end
		end
	end

	planets = collection.find(search_p, opts).sort(sort)

	if(!params[:limit].nil?)
		planets.limit(params[:limit].to_i)
	end

	if(!params[:start].nil?)
		planets.skip(Integer(params[:start].to_i))
	end

	return_response(planets.to_a)
end


get '/api/planets/:id' do

	collection = db.collection('planets')

	opts = get_find_opts(params)
	sort = get_sort_opts(params)

	if(params[:id] == "all")
		planets = collection.find({}, opts).sort(sort)
	else
		planets = collection.find({:_id => params[:id].to_s}, opts).sort(sort)
	end

	
	return_response(planets.to_a)
end


## returns the list of parameters to sort on
def get_sort_opts(params)
	if(params[:sort].nil?)
		return [['_id', 1]] # just sort on the id
	else
		fields = destringify_array(params[:sort])

		result = []
		fields.each do |f|
			parts = f.split(":")
			if(parts.count != 1)
				if(parts[1].to_s == "desc")
					result << [parts[0].to_s, -1]
				else
					result << [parts[0].to_s, 1]
				end
			else	
				result << [f.to_s, 1]
			end			
		end
		return result
	end
end

## returns the options for the find call. ( right now it is only used for field projection )
def get_find_opts(params)
	if(params[:fields].nil?)
		return {}
	else
		return {:fields => destringify_array(params[:fields]) }
	end
end

## Sets the content type and uses json.pretty_generate to return a result.
def return_response(response)
	content_type = "application/json"
	JSON.pretty_generate({"response" => {"results" => response, "count" => response.count}})
end

## turn a string in the form [a,b,c] into a ruby array
def destringify_array(str)
	return str.to_s.gsub("[","").gsub("]", "").split(",");
end


###############################################################################################################
##################################### DEMO SITE VIEWS #########################################################
###############################################################################################################
get '/' do 
	erb :index
end

get '/api_demo' do 
	erb :api_demo
end