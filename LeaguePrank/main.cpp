#include "mainwindow.h"

#include <QApplication>
#include "Methods.h"

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    a.setDesktopFileName(APPLICATION_NAME);
    a.setApplicationName(APPLICATION_NAME);
    //a.setApplicationDisplayName(APPLICATION_NAME);
    a.setApplicationVersion(APPLICATION_VERSION);

    MainWindow w;
    w.show();
    return a.exec();
}
