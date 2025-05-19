const { GraphQLID, GraphQLList } = require('graphql');
const User = require('../models/userSchema');
const UserType = require('./types/userType')

module.exports = {
  users: {
    type: new GraphQLList(UserType),
    resolve() {
      return User.find({});
    }
  },
  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
      return User.findById(args.id);
    }
  }
};