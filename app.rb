require 'rubygems'
require 'sinatra'
require 'json/pure'
require 'mongo'
include Mongo

db = Connection.new.db('test')



get '/api/planets/search' do

	collection = db.collection('planets')

	if(params[:fields].nil?)
		opts = {}
	else
		opts = {:fields => params[:fields].to_s.gsub("[","").gsub("]", "").split(",") }
	end
	

	planets = collection.find(params, opts)


	return_response(planets.to_a)
end


get '/api/planets/:id' do

	collection = db.collection('planets')

	if(params[:fields].nil?)
		opts = {}
	else
		opts = {:fields => params[:fields].to_s.gsub("[","").gsub("]", "").split(",") }
	end


	if(params[:id] == "all")
		planets = collection.find({}, opts)
	else
		planets = collection.find({:_id => params[:id].to_s}, opts)
	end

	
	return_response(planets.to_a)
end


def return_response(response)
	content_type = "application/json"
	JSON.pretty_generate({"response" => {"results" => response, "count" => response.count}})
end



get '/' do 
	erb :index
end