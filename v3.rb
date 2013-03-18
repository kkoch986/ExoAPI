# if(production?)
# 	v3db = Connection.new("localhost","12002").db('v3')
# else
# 	v3db = Connection.new("exoapi.com", "12002").db('v3')
# end

v3db = Connection.new("localhost","12002").db('v3')

get '/api/v3/planets/:id' do

	response['Access-Control-Allow-Origin'] = '*'

	@mixpanel.append_api("identify", request.ip)

	collection = v3db.collection('systems')

	opts = get_find_opts(params)
	sort = get_sort_opts(params)
	ref = request.referrer.nil? ? "/" : request.referrer

	if(params[:id] == "all")
		@mixpanel.track_event("Planets", 
			{
				:version => "v3",
				:mode => "planets/all", 
				:opts => opts, 
				:sort => sort, 
				:jsonp => params[:jsonp].nil?, 
				:ref => request.referrer.nil? ? "none" : request.referrer,
				:fields => params[:fields].nil? ? "all" : params[:fields].to_a.join(","),
				:limit => params[:limit].nil? ? false : params[:limit],
				:start => params[:start].nil? ? false : params[:start]
			})
		planets = collection.find( {"star.planet" => {"$exists" => 1}} , opts).sort(sort)
	else
		@mixpanel.track_event("Planets", 
			{
				:version => "v3",
				:mode => "planets/by id", 
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
