const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default: {
        SECRET: 'fg234345fdg23324ghyo',
        DATABASE: 'mongodb://localhost:27017/booksShelf'
    }
}

exports.get = function get(env){
    return config[env] || config.default;
}