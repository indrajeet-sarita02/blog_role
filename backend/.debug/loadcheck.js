function t(){console.log(new Date().toISOString().slice(11,19), '>>', arguments[0])}
t('load comments.validation'); require('../src/modules/comments/comments.validation');
t('loaded comments.validation');
t('load comments.service'); require('../src/modules/comments/comments.service');
t('loaded comments.service');
t('load comments.controller'); require('../src/modules/comments/comments.controller');
t('loaded comments.controller');
t('load comments.routes'); require('../src/modules/comments/comments.routes');
t('loaded comments.routes');
t('load postComments.routes'); require('../src/modules/comments/postComments.routes');
t('loaded postComments.routes');
process.exit(0);
