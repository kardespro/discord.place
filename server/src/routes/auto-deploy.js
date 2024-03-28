const bodyParser = require('body-parser');
const crypto = require('crypto');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = {
  post: [
    bodyParser.json(),
    async (request, response) => {
      const modifiedServerFiles = request.body.commits.reduce((acc, commit) => {
        commit.modified.forEach(file => {
          if (file.startsWith('server/')) acc.push(file);
        });
        return acc;
      }, []);

      if (!modifiedServerFiles.length) return response.sendError('No server files modified', 400);

      const signature = request.headers['x-hub-signature-256'];
      if (!signature) return response.sendError('No signature provided', 400);

      const hmac = crypto.createHmac('sha256', process.env.GITHUB_AUTO_DEPLOY_SECRET);
      hmac.update(JSON.stringify(request.body));

      const digest = Buffer.from('sha256=' + hmac.digest('hex'), 'utf8');
      const hash = Buffer.from(signature, 'utf8');
      
      try {
        if (hash.length !== digest.length || !crypto.timingSafeEqual(digest, hash)) return response.sendError('Invalid signature', 403);
      } catch (error) {
        return response.sendError('Invalid signature', 403);
      }

      try {
        const { stdout, stderr } = await exec('git pull');
        logger.send(stdout);
        if (stderr) logger.send(stderr);

        logger.send('Pull successful. Restarting server..');
        response.sendStatus(201);
        process.exit(0);
      } catch (error) {
        logger.send(`Error while pulling from GitHub:\n${error.stack}`);
        response.sendError(`Error while pulling from GitHub:\n${error.stack}`, 500);
      }
    }
  ]
};