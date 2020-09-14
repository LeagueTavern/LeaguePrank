#include "cefview.h"
#include <windows.h>
#include <QMessageBox>
#include <QColor>

CefView::CefView(const QString &url, QWidget *parent)
    : QCefView(url, parent)
{
}

CefView::~CefView()
{
}

void CefView::changeColor()
{
    qsrand(::GetTickCount());
    QColor color(qrand());

    QCefEvent event("colorChangedEvent");
    event.setStringProperty("color", color.name());
    broadcastEvent("colorChange", event);
}

void CefView::sendEvent(const QString &name, const QString &key, const QString &value)
{
    QCefEvent event("event");
    event.setStringProperty(key.toLatin1(), value);
    broadcastEvent(name.toLatin1(), event);
}

void CefView::onQCefUrlRequest(const QString &url)
{
    QString title("QCef Url Request");
    QString text = QString("Current Thread: QT_UI\r\n"
                           "Url: %1")
            .arg(url);

    //QMessageBox::information(this->window(), title, text);
}

void CefView::onQCefQueryRequest(const QCefQuery &query)
{
    QString title("QCef Query Request");
    QString text = QString("Current Thread: QT_UI\r\n"
                           "Query: %1\r\n"
                           "Response: %2")
            .arg(query.reqeust())
            .arg(query.response());

    //QMessageBox::information(this->window(), title, text);

    QString response = query.reqeust().toUpper();
    query.setResponseResult(true, response);
    responseQCefQuery(query);
}

void CefView::onInvokeMethodNotify(int browserId, int frameId, const QString &method, const QVariantList &arguments)
{
    Q_UNUSED(browserId)
    Q_UNUSED(frameId)
    //Q_UNUSED(arguments)

#if 0
    if (0 == method.compare("onDragAreaMouseDown")) {
        HWND hWnd = ::GetAncestor((HWND)getCefWinId(), GA_ROOT);

        // get current mouse cursor position
        POINT pt;
        ::GetCursorPos(&pt);

        // in case the mouse is being captured, try to release it
        ::ReleaseCapture();

        // simulate that the mouse left button is down on the title area
        ::SendMessage(hWnd, WM_NCLBUTTONDOWN, HTCAPTION, POINTTOPOINTS(pt));
        return;
    }
    QString title("QCef InvokeMethod Notify");
    QString text = QString("Current Thread: QT_UI\r\n"
                           "Method: %1\r\n"
                           "Arguments: %2")
            .arg(method).arg(arguments.first().toString());
    QMessageBox::information(this->window(), title, text);
#endif

    if (arguments.isEmpty()) {
        emit invokeMethod(method, "");
    } else {
        // 只获取第一个参数，也可将QVariantList传递过去由MainWindow进行控制
        emit invokeMethod(method, arguments.first().toString());
    }
}
