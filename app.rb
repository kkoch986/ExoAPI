require 'rubygems'
require 'sinatra'
require 'json/pure'
require 'mongo'
include Mongo

db = Connection.new.db('test')

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

	content_type = "application/json"
	JSON.pretty_generate(planets.to_a)
end

get '/api/stars/:id' do
	
end