const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const queryFields = require('./queries');
const mutationFields = require('./mutations');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => queryFields
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => mutationFields
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});