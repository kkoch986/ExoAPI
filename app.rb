require 'rubygems'
require 'sinatra'
require 'json/pure'
require 'mongo'
require 'mixpanel'
include Mongo

before do
  @mixpanel = Mixpanel::Tracker.new("444779380923a63b1846d1703993333d", request.env, true)
end

#db = Connection.new("localhost", "12002").db('test')
if(production?)
	db = Connection.new("localhost", "12002").db('test')
else
	db = Connection.new("exoapi.com", "12002").db('test')
end
#db = Connection.new("172.16.3.30","27017").db('test')

###############################################################################################################
##################################### API ... #################################################################
###############################################################################################################

get '/api/planets/search' do

	response['Access-Control-Allow-Origin'] = '*'

	collection = db.collection('planets')

	opts = get_find_opts(params)
	
	# process the parameters into something we can use for search (we would like to enable ranges here)
	sort = get_sort_opts(params)

	search_p = {}
	params.keys.each do |p|
		if(p != "fields" && p != "sort" && p != "limit" && p != "start" && p != "jsonp") 
			# look at the key and see if it contains a range symbol
			if(p.split(":").count == 1)			
					search_p[p] = Float(params[p]) rescue search_p[p] = params[p]
			else
				# split the operator and field name
				parts = p.split(":")
				field = parts[0]
				operator = parts[1]

				begin
					search_p[field] = {"$" + operator => Float(params[p])} 
				rescue 
					search_p[field] = {"$" + operator => params[p]}
				end
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

	@mixpanel.track_event("Planets", 
	{
		:mode => "search", 
		:opts => opts, 
		:sort => sort, 
		:jsonp => params[:jsonp].nil?, 
		:fields => params[:fields].nil? ? "all" : params[:fields].to_a.join(","),
		:ref => request.referrer.nil? ? "none" : request.referrer, 
		:limit => params[:limit].nil? ? false : params[:limit],
		:start => params[:start].nil? ? false : params[:start]
	}.merge(search_p))

	return_response(planets.to_a, params[:jsonp])
end


get '/api/planets/:id' do

	response['Access-Control-Allow-Origin'] = '*'

	@mixpanel.append_api("identify", request.ip)

	collection = db.collection('planets')

	opts = get_find_opts(params)
	sort = get_sort_opts(params)
	ref = request.referrer.nil? ? "/" : request.referrer

	if(params[:id] == "all")
		@mixpanel.track_event("Planets", 
			{
				:mode => "all", 
				:opts => opts, 
				:sort => sort, 
				:jsonp => params[:jsonp].nil?, 
				:ref => request.referrer.nil? ? "none" : request.referrer,
				:fields => params[:fields].nil? ? "all" : params[:fields].to_a.join(","),
				:limit => params[:limit].nil? ? false : params[:limit],
				:start => params[:start].nil? ? false : params[:start]
			})
		planets = collection.find({}, opts).sort(sort)
	else
		@mixpanel.track_event("Planets", 
			{
				:mode => "by id", 
				:opts => opts, 
				:sort => sort, 
				:jsonp => params[:jsonp].nil?, 
				:ref => request.referrer.nil? ? "none" : request.referrer,
				:limit => params[:limit].nil? ? false : params[:limit],
				:fields => params[:fields].nil? ? "all" : params[:fields].to_a.join(","),
				:start => params[:start].nil? ? false : params[:start]
			})
		planets = collection.find({:_id => params[:id].to_s}, opts).sort(sort)
	end


	if(!params[:limit].nil?)
		planets.limit(params[:limit].to_i)
	end

	if(!params[:start].nil?)
		planets.skip(Integer(params[:start].to_i))
	end
	
	return_response(planets.to_a, params[:jsonp])
end

get '/api/debug' do
	ref = request.referrer.nil? ? "/" : request.referrer
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
def return_response(response, jsonp)

	if(jsonp.nil?)
		content_type = "application/json"
		JSON.pretty_generate({"response" => {"results" => response, "count" => response.count}})
	else
		content_type = "text/javascript"
		jsonp + "(" + JSON.pretty_generate({"response" => {"results" => response, "count" => response.count}}) +  ")"
	end
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