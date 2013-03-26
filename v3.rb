# if(production?)
# 	v3db = Connection.new("localhost","12002").db('v3')
# else
# 	v3db = Connection.new("exoapi.com", "12002").db('v3')
# end

$v3db = Connection.new("localhost","12002").db('v3')

get '/api/v3/planets/search' do
	response['Access-Control-Allow-Origin'] = '*'
	@mixpanel.append_api("identify", request.ip)
	executeSearch('planets')
end

get '/api/v3/planets/:id' do
	response['Access-Control-Allow-Origin'] = '*'
	@mixpanel.append_api("identify", request.ip)
	executeIdQuery('planets')
end

get '/api/v3/systems/search' do
	response['Access-Control-Allow-Origin'] = '*'
	@mixpanel.append_api("identify", request.ip)
	executeSearch('systems')
end

get '/api/v3/systems/:id' do
	response['Access-Control-Allow-Origin'] = '*'
	@mixpanel.append_api("identify", request.ip)
	executeIdQuery('systems')
end


def executeSearch(cname)
	collection = $v3db.collection(cname)
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

				if(operator == "exists")
					search_p[field] = {"$exists" => 1} 
				else
					begin
						search_p[field] = {"$" + operator => Float(params[p])} 
					rescue 
						search_p[field] = {"$" + operator => params[p]}
					end
				end
			end
		end
	end

	results = collection.find(search_p, opts).sort(sort)

	if(!params[:limit].nil?)
		results.limit(params[:limit].to_i)
	end

	if(!params[:start].nil?)
		results.skip(Integer(params[:start].to_i))
	end

	@mixpanel.track_event(cname, 
	{
		:mode => "search", 
		:opts => opts, 
		:sort => sort, 
		:jsonp => params[:jsonp].nil?, 
		:fields => params[:fields].nil? ? "all" : params[:fields].gsub("[", "").gsub("]", ""), #.to_a.join(","),
		:ref => request.referrer.nil? ? "none" : request.referrer, 
		:limit => params[:limit].nil? ? false : params[:limit],
		:start => params[:start].nil? ? false : params[:start]
	}.merge(search_p))

	return_response(results.to_a, params[:jsonp])
end

def executeIdQuery(cname)
	collection = $v3db.collection(cname)
	opts = get_find_opts(params)
	sort = get_sort_opts(params)
	ref = request.referrer.nil? ? "/" : request.referrer

	if(params[:id] == "all")
		@mixpanel.track_event(cname, 
			{
				:version => "v3",
				:mode => cname + "/all", 
				:opts => opts, 
				:sort => sort, 
				:jsonp => params[:jsonp].nil?, 
				:ref => request.referrer.nil? ? "none" : request.referrer,
				:fields => params[:fields].nil? ? "all" : params[:fields].gsub("[", "").gsub("]", ""), # .join(","),
				:limit => params[:limit].nil? ? false : params[:limit],
				:start => params[:start].nil? ? false : params[:start]
			})
		planets = collection.find( { } , opts).sort(sort)
	else
		@mixpanel.track_event(cname, 
			{
				:version => "v3",
				:mode => cname + "/by id", 
				:opts => opts, 
				:sort => sort, 
				:jsonp => params[:jsonp].nil?, 
				:ref => request.referrer.nil? ? "none" : request.referrer,
				:limit => params[:limit].nil? ? false : params[:limit],
				:fields => params[:fields].nil? ? "all" : params[:fields].gsub("[", "").gsub("]", ""), #.to_a.join(","),
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
