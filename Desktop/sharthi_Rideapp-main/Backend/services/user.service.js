const userModel = require('../models/user.model');


module.exports.createUser = async ({
    firstname, lastname,phone, college, email, password
}) => {
    if (!firstname || !phone || !college || !email || !password) {
        throw new Error('All fields are required');
    }
    const user = userModel.create({
        fullname: {
            firstname,
            lastname
        },
        phone,
        college,
        email,
        password
    })

    return user;
}