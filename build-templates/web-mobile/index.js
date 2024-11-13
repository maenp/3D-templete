System.register(["application"], function (_export, _context) {
  "use strict";

  var Application, canvas, $p, bcr, application;

  function topLevelImport(url) {
    return System["import"](url);
  }

  function modifyLoaderWithBid() {
    var downloader = cc.assetManager.downloader;//下载器

    // json js加bid  
    var downloadJson = downloader._downloaders['.json'];
    // downloader._downloaders['.json'] = (url, options, onComplete) => {
    //   url = url + '?_bid=' + window.AppBid;
    //   console.log(url);
    //   downloadJson(url, options, onComplete);
    // };
    var downloadScript = downloader._downloaders['.js'];
    var REGEX = /^(?:\w+:\/\/|\.+\/).+/;
    downloader._downloaders.bundle = (nameOrUrl, options, onComplete) => {
      var bundleName = cc.path.basename(nameOrUrl);
      var url = nameOrUrl;
      if (!REGEX.test(url)) {
        if (downloader.remoteBundles.indexOf(bundleName) !== -1) {
          url = downloader.remoteServerAddress + 'remote/' + bundleName;
        } else {
          url = 'assets/' + bundleName;
        }
      }
      var version = options.version || downloader.bundleVers[bundleName];
      var count = 0;
      var config = url + '/config.' + (version ? (version + '.') : '') + 'json?_bid=' + window.AppBid;
      var out = null, error = null;
      downloadJson(config, options, (err, response) => {
        error = err;
        out = response;
        if (out) { out.base = url + '/'; }
        if (++count === 2) {
          onComplete(error, out);
        }
      });

      var jspath = url + '/index' + (version ? version : '') + '.js?_bid=' + window.AppBid;
      downloadScript(jspath, options, (err) => {
        error = err;
        if (++count === 2) {
          onComplete(err, out);
        }
      });
    };

    // 图片加bid
    var download = downloader.download;
    downloader.download = function (id, url, type, options, onComplete) {
      //bundle在内部加bid。网络图片不用加bid
      if (type !== "bundle" && id.indexOf("http") != 0) {
        url = url + '?_bid=' + window.AppBid;
      }
      download.call(this, id, url, type, options, onComplete);
    };
  }

  return {
    setters: [function (_applicationJs) {
      Application = _applicationJs.Application;
    }],
    execute: function () {
      canvas = document.getElementById('GameCanvas');
      $p = canvas.parentElement;
      bcr = $p.getBoundingClientRect();
      canvas.width = bcr.width;
      canvas.height = bcr.height;
      application = new Application();
      topLevelImport('cc').then(function (engine) {
        modifyLoaderWithBid();
        return application.init(engine);
      }).then(function () {
        return application.start();
      })["catch"](function (err) {
        console.error(err);
      });
    }
  };
});