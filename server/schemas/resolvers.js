const { User, Book } = require('../models');

const resolvers = {
    Query: {
        user: async (parent, { username }) => {
            return User.findOne({ username })
            .select('-__v -password')
            .populate('books')
        }
    },
    Mutations: {
        createUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user)

            return {token, user}
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('wrong')
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password')
            }

            const token = signToken(user);
            return { token, user };
        }
    }
}