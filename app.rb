require 'rubygems'
require 'sinatra'
require 'json/pure'
require 'mongo'
require 'mixpanel'
include Mongo

before do
  @mixpanel = Mixpanel::Tracker.new("444779380923a63b1846d1703993333d", request.env, true)
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
##################################### API SITES ###############################################################
###############################################################################################################
require 'v1.rb'
require 'skyhook.rb'

###############################################################################################################
##################################### DEMO SITE VIEWS #########################################################
###############################################################################################################
get '/' do 
	erb :index
end

get '/api_demo' do 
	erb :api_demo
end