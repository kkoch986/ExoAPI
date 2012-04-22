

sudo mongod --fork --logpath /var/log/mongodb.log --logappend;
forever start node/process.js;
exit;