QT       += core gui #concurrent

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++11

# The following define makes your compiler emit warnings if you use
# any Qt feature that has been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    cefview.cpp \
    lockfilereader.cpp \
    main.cpp \
    mainwindow.cpp

HEADERS += \
    Methods.h \
    cefview.h \
    lockfilereader.h \
    mainwindow.h \
    processinfo.h

FORMS += \
    mainwindow.ui

# ================= LIB & Include =================
win32: LIBS += -L$$PWD/../QCefView/lib/ -lQCefView -llibcef
win32: LIBS += -luser32

INCLUDEPATH += $$PWD/../QCefView/include
DEPENDPATH += $$PWD/../QCefView/include
# ================= LIB & Include =================

# ==================== Resource ====================
RC_ICONS = LeaguePrank.ico

VERSION = 1.0.0

QMAKE_TARGET_PRODUCT = League Prank
QMAKE_TARGET_COMPANY = Studio
QMAKE_TARGET_DESCRIPTION = League Prank
QMAKE_TARGET_COPYRIGHT = 2020 Studio. All Rights Reserved.

QMAKE_LFLAGS += /MANIFESTUAC:\"level=\'requireAdministrator\' uiAccess=\'false\'\"
# ==================== Resource ====================

# ====================== Flags =====================
QMAKE_CXXFLAGS_RELEASE += -O2       # Release -O2
# ====================== Flags =====================
