#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QMessageBox>
#include "processinfo.h"
#include "Methods.h"
#include <QGridLayout>
//#include <QtConcurrent>

/* Json */
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonDocument>
#include <QDesktopServices>

#include <QProcess>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    this->setWindowTitle(APPLICATION_NAME);
    this->setMinimumSize(980, 620);
    this->resize(1220, 740);

    /* 获取程序根目录与主页文件 */
    m_appDir = QCoreApplication::applicationDirPath();
    m_homePageUrl = QDir::toNativeSeparators(m_appDir.filePath("view/index.html"));

    /* 判断主页文件是否存在 */
    if (!isFileExist(m_homePageUrl)) {
        QMessageBox::critical(nullptr, "Error!", QString::fromLocal8Bit("文件丢失, 请检查文件的完整性或重新安装软件!"));
        exit(-1);
    }

    /* 加载CEF */
    m_cefView = new CefView(m_homePageUrl, this);
#if 1
    this->setCentralWidget(m_cefView);
#else
    QGridLayout *layout = new QGridLayout;
    layout->addWidget(m_cefView);
    ui->widget->setLayout(layout);
#endif

    m_lockFileReader = new LockFileReader();

    /* 遍历进程,获取游戏路径、配置文件等信息并组成json发送给JavaScript端.
       原定程序启动时主动向Web端发送配置信息,由于遍历进程和读取文件会导致界面的延迟显示，
       采用多线程或并发不好做同步,所以采用被动的方式.
       当收到路径、配置文件的请求时发送数据 */
    //sendGamePathList();
    //sendProfile();

    /* 全部初始化后链接相应信号槽 */
    connect(m_cefView, &CefView::invokeMethod, this, &MainWindow::onInvokeMethod);
}

MainWindow::~MainWindow()
{
    delete m_cefView;
    delete m_lockFileReader;
    delete ui;
}

void MainWindow::on_btn_send_clicked()
{
    m_cefView->sendEvent(ui->edit_event->text(),
                         ui->edit_key->text(),
                         ui->edit_value->toPlainText());
}

/**
 * @brief onInvokeMethod 相应JavaScript端的方法调用
 * @param method 方法名
 * @param argument 参数
 */
void MainWindow::onInvokeMethod(QString method, QString argument)
{
    if (PROFILE_READ == method) {
        readProfile();
    } else if (PROFILE_WRITE == method) {
        saveProfile(argument);
    } else if (PATH_LIST_GET == method) {
        sendGamePathList();
    } else if (OPEN_URL == method) {
        QDesktopServices::openUrl(QUrl(argument));
    } else if (ABOUT_QT == method) {
        QMessageBox::aboutQt(nullptr);
    }
}

/**
 * @brief sendGamePathList 读取游戏配置信息并组成Json发送至JavaScript端
 */
void MainWindow::sendGamePathList()
{
    /* 遍历进程获取游戏路径 */
    QStringList pathList;

    pathList = GetProcessFullPaths("LeagueClient.exe");
    if (pathList.isEmpty()) {
        QProcess process;
        process.start("wmic process where name='LeagueClient.exe' GET ExecutablePath");
        process.waitForFinished(-1);
        QString result = QString::fromLocal8Bit(process.readAllStandardOutput());
        if (result.left(CMD_EXECUTABLE_PATH.length()) == CMD_EXECUTABLE_PATH) {
            pathList = result.split("\n");
            /* 去除第一行和后两行空白 */
            pathList.removeFirst();
            pathList.removeLast();
            pathList.removeLast();
        }
    }

#if 0  // 会在H5中进行弹窗显示
    if (pathList.isEmpty()) {
        QMessageBox::warning(nullptr, "Error!", QString::fromLocal8Bit("请先运行游戏再开启此软件!"));
    }
#endif

    /* 读取lockfile并生成JSON发送至JavaScript端 */
    QJsonObject jRoot;
    QJsonObject jInfo;
    QJsonArray jArray;
    QString tmpPath;
    foreach (QString path, pathList) {
        /* Read lockfile */
        path = path.trimmed();  // 去除头部空格
        tmpPath = path.left(path.length() - QString("/LeagueClient.exe").length());
        if (!m_lockFileReader->setGamePath(tmpPath)) {
            continue;
        }

        jInfo["path"] = path;
        jInfo["token"] = m_lockFileReader->getToken();
        jInfo["url"] = m_lockFileReader->getUrl();
        jInfo["protocol"] = m_lockFileReader->getProtocol();
        jArray << jInfo;
    }
    jRoot["type"] = "GAME_PATH";
    jRoot["version"] = "1.0";
    jRoot["list"] = jArray;
    QByteArray jData = QJsonDocument(jRoot).toJson();

    m_cefView->sendEvent(PATH_LIST_SET, "pathList", QString(jData));
    //QMessageBox::about(this, QString::number(QString(jData).size()), QString(jData));
}

/**
 * @brief readProfile 读取配置文件并发送给JavaScript端
 */
void MainWindow::readProfile()
{
    QString profileString = "{}";
    m_profile.setFileName(QDir::toNativeSeparators(m_appDir.filePath("settings.profile")));
    if (m_profile.open(QIODevice::ReadWrite)) {
        QByteArray data = m_profile.readAll();
        if (!data.isEmpty()) {
            profileString = QString(data);
        }
    }
    m_profile.close();

    m_cefView->sendEvent(PROFILE_READ, "profile", profileString);
}

/**
 * @brief saveProfile 保存配置文件
 * @param profile 要保存的内容
 */
void MainWindow::saveProfile(const QString &profile)
{
    if (m_profile.open(QIODevice::ReadWrite)) {
        m_profile.write(profile.toLatin1());
    } else {
        //QMessageBox::critical(this, "Error!", QString::fromLocal8Bit("无法保存配置文件!"));
    }
    m_profile.close();
}
