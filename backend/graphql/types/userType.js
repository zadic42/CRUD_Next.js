const { GraphQLObjectType, GraphQLString, GraphQLID } = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { 
      type: GraphQLID,
      resolve: (parent) => parent._id.toString()
    },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    position: { type: GraphQLString },
  }),
});
