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
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const book = await Book.create({ ...args, username: context.user.username});

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push:  { books: book._id } },
                    { new: true}
                );

                return book;
            }

            throw new AuthenticationError('You need to be logged in')
        },
        deleteBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: {books: book._id } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in')
        }
    }
};

module.exports = resolvers;