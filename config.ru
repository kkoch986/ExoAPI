require 'rubygems'
require 'sinatra'
require 'app.rb'

run Sinatra::Application


use "Mixpanel::Tracker::Middleware", "444779380923a63b1846d1703993333d", :async => true