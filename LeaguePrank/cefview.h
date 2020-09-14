#ifndef CEFVIEW_H
#define CEFVIEW_H

#include <QCefView.h>

class CefView : public QCefView
{
    Q_OBJECT
public:
    CefView(const QString& url, QWidget *parent);
    ~CefView();

    void changeColor();
    void sendEvent(const QString &name, const QString &key, const QString &value);

signals:
    void invokeMethod(QString method, QString argument);

protected:
    virtual void onQCefUrlRequest(const QString& url) override;
    virtual void onQCefQueryRequest(const QCefQuery& query) override;
    virtual void onInvokeMethodNotify(int browserId, int frameId,
                                      const QString& method,
                                      const QVariantList& arguments) override;

private:
};

#endif // CEFVIEW_H
