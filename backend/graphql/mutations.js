const { GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull } = require('graphql');
const User = require('../models/userSchema');
const UserType = require('./types/userType');

module.exports = {
  addUser: {
    type: UserType,
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      position: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve(_, args) {
      const user = new User({ name: args.name, email: args.email, position: args.position });
      return user.save();
    }
  },
  updateUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      position: { type: GraphQLString },
    },
    resolve(_, args) {
      const updates = {};
      if (args.name) updates.name = args.name;
      if (args.email) updates.email = args.email;
      if (args.position) updates.position = args.position;
      return User.findByIdAndUpdate(args.id, updates, { new: true });
    }
  },
  deleteUser: {
    type: UserType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve(_, args) {
      return User.findByIdAndDelete(args.id);
    }
  }
};
