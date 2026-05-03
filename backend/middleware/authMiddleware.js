const jwt = require('jsonwebtoken');
const clerk = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      if (!process.env.CLERK_API_KEY) {
        console.error(error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }

    try {
      const client = await clerk.clients.verifyClient(token);

      if (!client?.userId) {
        return res.status(401).json({ message: 'Not authorized, invalid Clerk token' });
      }

      let user = await User.findOne({ clerkId: client.userId }).select('-password');

      if (!user) {
        const clerkUser = await clerk.users.getUser(client.userId);
        const emailAddress = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || emailAddress || 'Clerk User';

        user = await User.create({
          name,
          email: emailAddress,
          clerkId: client.userId,
          isVerified: true,
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
