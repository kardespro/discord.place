const slugValidation = require('@/validations/profiles/slug');
const useRateLimiter = require('@/utils/useRateLimiter');
const { param, validationResult, matchedData, body } = require('express-validator');
const Profile = require('@/schemas/Profile');
const Premium = require('@/schemas/Premium');
const bodyParser = require('body-parser');
const checkAuthentication = require('@/utils/middlewares/checkAuthentication');
const birthdayValidation = require('@/validations/profiles/birthday');
const socialsValidation = require('@/validations/profiles/socials');

module.exports = {
  get: [
    useRateLimiter({ maxRequests: 20, perMinutes: 1 }),
    param('slug')
      .isString().withMessage('Slug must be a string.')
      .isLength({ min: 3, max: 32 }).withMessage('Slug must be between 3 and 32 characters.')
      .custom(slugValidation).withMessage('Slug is not valid.'),
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) return response.sendError(errors.array()[0].msg, 400);
      
      const { slug } = matchedData(request);
      const profile = await Profile.findOne({ slug });
      if (!profile) return response.sendError('Profile not found.', 404);

      const permissions = {
        canEdit: request.user && (
          request.user.id == profile.user.id ||
          config.permissions.canEditProfiles.includes(request.user.id)
        ) || false,
        canDelete: request.user && (
          request.user.id == profile.user.id ||
          config.permissions.canDeleteProfiles.includes(request.user.id)
        ) || false
      };
      const isLiked = profile.likes.includes(request.user?.id || request.clientIp);

      const publiclySafe = await profile.toPubliclySafe();
      Object.assign(publiclySafe, { permissions, isLiked });

      return response.json(publiclySafe);
    }
  ],
  patch: [
    checkAuthentication,
    useRateLimiter({ maxRequests: 10, perMinutes: 1 }),
    bodyParser.json(),
    param('slug')
      .isString().withMessage('Slug must be a string.')
      .isLength({ min: 3, max: 32 }).withMessage('Slug must be between 3 and 32 characters.')
      .custom(slugValidation).withMessage('Slug is not valid.'),
    body('newSlug')
      .optional()
      .isString().withMessage('Slug must be a string.')
      .isLength({ min: 3, max: 32 }).withMessage('Slug must be between 3 and 32 characters.')
      .custom(slugValidation).withMessage('Slug is not valid.'),
    body('occupation')
      .optional()
      .isString().withMessage('Occupation must be a string.')
      .isLength({ min: 4, max: 64 }).withMessage('Occupation must be between 4 and 64 characters.')
      .trim(),
    body('gender')
      .optional()
      .isString().withMessage('Gender must be a string.')
      .isIn(['Male', 'Female', 'Unknown']).withMessage('Gender must be one of them: Male, Female, Unknown'),
    body('location')
      .optional()
      .isString().withMessage('Location must be a string.')
      .isLength({ min: 4, max: 64 }).withMessage('Location must be between 4 and 64 characters.')
      .trim(),
    body('birthday')
      .optional()
      .isString().withMessage('Birthday must be a string.')
      .isLength({ min: 3, max: 32 }).withMessage('Birthday must be between 4 and 32 characters.')
      .custom(birthdayValidation).withMessage('Birthday should be a valid date in the format of MM/DD/YYYY.'),
    body('bio')
      .optional()
      .isString().withMessage('Bio must be a string.')
      .isLength({ min: 4, max: 512 }).withMessage('Bio must be between 4 and 512 characters.')
      .trim(),
    body('preferredHost')
      .optional()
      .isString().withMessage('Preferred host must be a string.')
      .isIn(['discord.place/p', 'dsc.wtf']).withMessage('Preferred host is not valid.'),
    body('socials')
      .optional()
      .isObject().withMessage('Socials must be an object.')
      .custom(socialsValidation),
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) return response.sendError(errors.array()[0].msg, 400);
      
      const { slug, newSlug, occupation: newOccupation, gender: newGender, location: newLocation, birthday: newBirthday, bio: newBio, preferredHost: newPreferredHost, socials } = matchedData(request);
      const profile = await Profile.findOne({ slug });
      if (!profile) return response.sendError('Profile not found.', 404);

      const canEdit = request.user.id == profile.user.id || config.permissions.canEditProfiles.includes(request.user.id);
      if (!canEdit) return response.sendError('You do not have permission to edit this profile.', 403);

      if (newPreferredHost === 'dsc.wtf') {
        const foundPremium = await Premium.findOne({ 'user.id': profile.user.id });
        if (!foundPremium) return response.sendError('You must be premium to use this host.', 403);
      }

      if (newSlug) {
        const slugExists = await Profile.findOne({ slug: newSlug });
        if (slugExists) return response.sendError('Slug is not available.', 400);

        profile.slug = newSlug;
      }

      if (socials) {
        const keys = Object.keys(socials);
        keys.forEach(key => {
          if (key === 'custom') {
            try {
              const url = new URL(socials[key]);
              if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Custom social link is not valid.');
              if (profile.socials.some(({ link }) => link === socials[key])) throw new Error('You have already added this social.');
              
              profile.socials.push({ type: 'custom', link: socials[key] });
            } catch (error) {
              return response.sendError('Custom social link is not valid.', 400);
            }
          } else {
            const baseUrls = {
              instagram: 'https://instagram.com/',
              tiktok: 'https://tiktok.com/@',
              facebook: 'https://facebook.com/',
              steam: 'https://steamcommunity.com/id/',
              github: 'https://github.com/',
              twitch: 'https://twitch.tv/',
              youtube: 'https://youtube.com/@',
              x: 'https://x.com/',
              twitter: 'https://twitter.com/'
            };

            profile.socials.push({ 
              type: key,
              handle: socials[key],
              link: baseUrls[key] + socials[key]
            });
          }
        });

        if (profile.socials.length > config.profilesMaxSocialsLength) return response.sendError(`You can only add up to ${config.profilesMaxSocialsLength} socials.`, 400);
      }

      if (newOccupation) profile.occupation = newOccupation;
      if (newGender) {
        if (newGender === 'Unknown') profile.gender = undefined;
        else profile.gender = newGender;
      }
      if (newLocation) profile.location = newLocation;
      if (newBirthday) profile.birthday = newBirthday;
      if (newBio) profile.bio = newBio;
      if (newPreferredHost) profile.preferredHost = newPreferredHost;

      const validationErrors = profile.validateSync();
      if (validationErrors) return response.sendError('An unknown error occurred.', 400);

      if (!profile.isModified()) return response.sendError('No changes were made.', 400);

      await profile.save();

      return response.status(200).json({ 
        success: true,
        profile: await profile.toPubliclySafe()
      });
    }
  ],
};