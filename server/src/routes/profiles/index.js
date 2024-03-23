const slugValidation = require('@/validations/profiles/slug');
const useRateLimiter = require('@/utils/useRateLimiter');
const bodyParser = require('body-parser');
const { body, validationResult, matchedData } = require('express-validator');
const Profile = require('@/schemas/Profile');
const Premium = require('@/schemas/Premium');
const checkAuthentication = require('@/utils/middlewares/checkAuthentication');

module.exports = {
  post: [
    checkAuthentication,
    useRateLimiter({ maxRequests: 5, perMinutes: 1 }),
    bodyParser.json(),
    body('slug')
      .isString().withMessage('Slug must be a string.')
      .isLength({ min: 3, max: 32 }).withMessage('Slug must be between 3 and 32 characters.')
      .custom(slugValidation).withMessage('Slug is not valid.'),
    body('preferredHost')
      .isString().withMessage('Preferred host must be a string.')
      .isIn(['discord.place/p', 'dsc.wtf']).withMessage('Preferred host is not valid.'),
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) return response.sendError(errors.array()[0].msg, 400);
      
      const { slug, preferredHost } = matchedData(request);
      const profile = await Profile.findOne({ slug });
      if (profile) return response.sendError('Slug is not available.', 400);

      const userHasProfile = await Profile.findOne({ 'user.id': request.user.id });
      if (userHasProfile) return response.sendError('You already have a profile.', 400);

      if (preferredHost === 'dsc.wtf') {
        const foundPremium = await Premium.findOne({ 'user.id': request.user.id });
        if (!foundPremium) return response.sendError('You must be premium to use this host.', 403);
      }
      
      const newProfile = new Profile({
        user: {
          id: request.user.id
        },
        slug,
        preferredHost
      });

      const validationErrors = newProfile.validateSync();
      if (validationErrors) return response.sendError('An unknown error occurred.', 400);

      await newProfile.save();

      return response.status(204).end();
    }
  ]
};