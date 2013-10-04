var MembersModel = Backbone.Model.extend({
	urlRoot: '/members'
});

var SailsCollection = Backbone.Collection.extend({
	sailsCollection: "",
	socket: null,
	sync: function(method, model, options){
	  var where = {};
	  if (options.where) {
            where = {
		    where: options.where
		  }
		}
	    if(typeof this.sailsCollection === "string") {
		this.socket = io.connect();
		this.socket.on("connect", _.bind(function(){
		  this.socket.request("/" + this.sailsCollection, where, _.bind(function(users){
		    this.set(users);
		  }, this));
			this.socket.on("message", _.bind(function(msg){
			  console.log(msg);
			  var m = msg.verb;
			  console.log(m);
			if (m === "create") {
			  this.add(msg.data);
			} else if (m === "update") {
			  this.get(msg.data.id).set(msg.data);
			} else if (m === "destroy") {
			  console.log("yep");
			this.remove(this.get(msg.data.id));
                      }
		    }, this));
		  }, this));
		} else {
				console.log("Error: Cannot retrieve models because property 'sailsCollection' not set on collection");
		}
	}
});

var MembersCollection = SailsCollection.extend({
	sailsCollection: 'members',
	model: MembersModel
});

var members = new MembersCollection();

members.fetch();
