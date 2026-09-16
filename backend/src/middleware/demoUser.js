const DEMO_USERS = new Set(['demo-auditor', 'demo-reviewer', 'demo-admin']);

function requireDemoUser(req, res, next) {
  const userId = String(req.headers['x-demo-user-id'] || '').trim();
  if (!DEMO_USERS.has(userId)) {
    return res.status(401).json({ success: false, message: 'Demo user identity required' });
  }
  req.demoUserId = userId;
  next();
}

module.exports = { requireDemoUser };