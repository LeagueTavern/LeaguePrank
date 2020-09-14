#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>

/* File */
#include <QDir>
#include <QFile>

/**/
#include "cefview.h"
#include "lockfilereader.h"

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_btn_send_clicked();
    void onInvokeMethod(QString method, QString argument);

private:
    void sendGamePathList();
    void readProfile();
    void saveProfile(const QString &profile);

private:
    Ui::MainWindow *ui;

    QDir m_appDir;
    QString m_homePageUrl;

    CefView *m_cefView;
    LockFileReader *m_lockFileReader;
    QFile m_profile;
};
#endif // MAINWINDOW_H
