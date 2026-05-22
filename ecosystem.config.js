module.exports = {
  apps: [{
    name: "referral-bridge",
    script: "/opt/nodejs/current/bin/npm",
    args: "start",
    cwd: "/home2/goodlabgroup/public_html/ai/apps/referral-bridge",
    env: {
      NODE_ENV: "production",
      PORT: 3002,
    },
  }],
};
