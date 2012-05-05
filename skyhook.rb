if(production?)
	skyhookdb = Connection.new("localhost", "12002").db('skyhook')
else
	skyhookdb = Connection.new("exoapi.com", "12002").db('skyhook')
end


get '/api/skyhook/planets/search' do

	response['Access-Control-Allow-Origin'] = '*'

	collection = skyhookdb.collection('planets')

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


get '/api/skyhook/planets/:id' do

	response['Access-Control-Allow-Origin'] = '*'

	@mixpanel.append_api("identify", request.ip)

	collection = skyhookdb.collection('planets')

	opts = get_find_opts(params)
	sort = get_sort_opts(params)
	ref = request.referrer.nil? ? "/" : request.referrer

	if(params[:id] == "all")
		@mixpanel.track_event("Planets", 
			{
				:version => "skyhook",
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
				:version => "skyhook",
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