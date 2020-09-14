#ifndef METHODS_H
#define METHODS_H

#include <QString>

/* Application */
const QString APPLICATION_NAME    = "League Prank";
const QString APPLICATION_VERSION = "1.0.0";

/* Profile */
const QString PROFILE_READ  = "LCUreadProfile";   // 读取配置文件并发送给H5
const QString PROFILE_WRITE = "LCUwriteProfile";  // 保存配置文件

/* Path List */
const QString PATH_LIST_GET = "LCUgetPathList";
const QString PATH_LIST_SET = "LCUsetPathList";

/* Open link */
const QString OPEN_URL      = "LCUopenUrl";

/* About Qt */
const QString ABOUT_QT      = "LCUaboutQt";

#endif // METHODS_H
