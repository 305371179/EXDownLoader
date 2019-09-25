require('../../public/beautify/beautify')
require('../../public/beautify/beautify-css')
require('../../public/beautify/beautify-html')
require('../../public/zip/zip')

const utils = {
    isDownloading: false,
    downloadThread: 5,
    toDownload: [],
    isCheckHAR: true,
    isCheckCache: false,
    isCheckBeautify: true,
    isCheckContent: false,
    isCurrentDomain: false,
    isCheckXHR: false,
    isOpenFolder: true,
    isNotification: true,
    isTimestamp: true,
    isResourcesType: false,
    filename: '',
    defaultFilename: 'All',
    currentFilename: '',
    timeout: 5,
// Resource Collector
    reqs: {},
    noContentReqs: {},
    component: null,
    setFileName(filename) {
        this.filename = filename
        this.setStorage('filename', filename)
    },
    setTimeout(timeout) {
        this.timeout = timeout
        this.setStorage('timeout', timeout)
    },
    setSettings(settings) {
        Object.assign(this, settings)
        this.setStorage('settings', settings)
    },
    setStorage(key, value) {
        return new Promise(resolve => {
            let obj = {}
            obj[key] = value
            chrome.storage.sync.set(obj, function () {
                resolve()

                // utils.getStorage('settings').then(value=>{
                //     sendMessage(value,666666)
                //     // value?Object.assign(this.settings,value.settings):''
                // })
            });
        })
    },
    getStorage(key) {
        return new Promise(resolve => {
            let obj = {}
            obj[key] = null
            chrome.storage.sync.get(obj, function (value) {
                resolve(value)
            });
        })
    },
    captureWindow(callback) {
        chrome.tabs.captureVisibleTab(null, null, callback)
    },
    openWindow(url) {
        chrome.tabs.create({
            url: url,
        })
    },
    debounce(func, wait, immediate) {
        var timeout;
        return () => {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        }
    },
    created(comp = {}) {
        // chrome.downloads.download({
        //         url: 'http://localhost:6334/ResourcesSaverExt/time.mp3', //currentURL.url
        //         filename:'a/a.mp3',
        //         saveAs: false
        //     },()=>{})


        // document.body.removeChild(downloadFileA)
        this.component = comp
        chrome.devtools.network.onRequestFinished.addListener((req) => {
            // console.log(req.request,333)
            // Only collect Resource when XHR option is enabled
            if (this.isCheckHAR) {
                console.log('Resource Collector pushed: ', req.request.url);
                req.getContent((body, encoding) => {
                    // console.log(req.request,444)
                    // if(req.request.type)
                    if (!body) {
                        console.log('No Content Detected!, Resource Collector will ignore: ', req.request.url);
                        this.noContentReqs[req.request.url] = req.request.url
                    } else {
                        this.reqs[req.request.url] = {
                            body,
                            encoding
                        };
                    }
                    setResourceCount();
                });
                setResourceCount();
            }
        });
        let setResourceCount = this.debounce(() => {
            if (this.isCheckHAR) {
                chrome.devtools.network.getHAR((logInfo) => {
                    // logInfo.entries.forEach(entry=>{
                    //     console.log(entry.request.url,55555)
                    // })
                    if (!this.component.isDownloading) {
                        this.component.requests = logInfo.entries
                    }
                    getResources()
                });
            } else {
                getResources()
            }
        }, 150);
        let getResources = () => {
            this.getResources((resources) => {
                // resources.forEach(r=>{
                //     console.log(r.url,444)
                // })
                if (!this.component.isDownloading) {
                    this.component.resources = resources
                    if (this.component.requests.length) {
                        let result = []
                        this.component.requests.forEach(entry => {
                            const index = this.component.resources.findIndex(it => {
                                // console.log(item.request.url,it.url,66666)
                                return entry.request.url === it.url
                            })
                            if (index === -1) {
                                let mimeType = entry.response.content.mimeType || 'text/plain'
                                if (mimeType.indexOf('audio') !== -1 || mimeType.indexOf('video') !== -1) {
                                    mimeType = 'media'
                                    // console.log(entry.response)
                                    // console.log(this.component.resources[0].getContent((a)=>{
                                    //     console.log(a,6666)
                                    // }))
                                } else {
                                    mimeType = 'xhr'
                                }
                                result.push(Object.assign({}, {
                                    url: entry.request.url,
                                    getContent: entry.getContent || (() => {
                                        return true
                                    }),
                                    type: mimeType,//,
                                    isStream: (entry.response.content.mimeType || '').indexOf('event-stream') !== -1
                                }))
                            }
                        })
                        // console.log(result,666666)
                        this.component.resources = this.filter(this.component.resources.concat(result))
                        // this.component.resources.forEach(r=>{
                        //     console.log(r.url,77777)
                        // })
                    }
                }
                // sendMessage(resources)
                // sendMessage(this.component.requests)
            })
        }
        getResources()
        let count = 0
        let interval = setInterval(() => {
            if (++count > 10) {
                clearInterval(interval)
            }
            setResourceCount()
        }, 500)

        // //This can be used for identifying when ever a new resource is added
        chrome.devtools.inspectedWindow.onResourceAdded.addListener((resource) => {
            setResourceCount()
        });
        //
        // //This can be used to detect when ever a resource code is changed/updated
        chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener((resource, content) => {
            setResourceCount()
        });
    },
    // parseMimType(type){
    //   // if(type.indexOf())
    // },
    getResources(callback) {
        chrome.devtools.inspectedWindow.getResources(callback);
    },
    resetResourceCollector() {
        this.reqs = {};
    },
    preview(url) {
        chrome.devtools.panels.openResource(
            url,  //要打开的资源的URL
            0,//指定资源加载时需要滚动到的行号
            function callback() {
                //成功加载资源后会调用
            }
        )
    },
    save(selectItems) {
        if (this.component.isDownloading) return
        this.component.downInfo.startTime = Date.now()
        this.timestamp = Date.now()
        this.getXHRs((xhrResources) => {
            // Disable download notification
            try {
                chrome.downloads.setShelfEnabled(false);
            } catch (e) {
                console.error(e)
            }

            chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                console.log('Save content from: ', tab.url);
                let domain = tab.url.split('://')[1].substring(0, tab.url.split('://')[1].indexOf('/'));
                this.getResources((resources) => {
                    //过滤掉没用的资源，谷歌自身的扩展和开发环境的webpack资源
                    let allResources = this.filter(xhrResources.concat(resources, this.component.resources))
                    // sendMessage(allResources)
                    if (selectItems) {
                        let rs = []
                        for (let i = 0; i < selectItems.length; i++) {
                            let item = selectItems[i]
                            let index = allResources.findIndex(it => {
                                return it.url === item.url
                            })
                            rs.push(allResources[index])
                        }
                        allResources = rs
                    }
                    this.component.downInfo.files = allResources
                    this.download(allResources, domain, selectItems)
                });
            })
        })
    },
    getCurrentUrl(callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (!tabs) {
                return
            }
            callback && callback(tabs[0].url)
        });
    },
    download(allResources, domain, selectItems) {
        this.processContentFromResources(allResources, (combineResources) => {
            // Filter Resource here
            if (this.isCheckHAR) {
                for (let i = 0; i < combineResources.length; i++) {
                    if (!combineResources[i].url.includes('Chrome/Default/Extensions')) {
                        let foundIndex = this.toDownload.findIndex((item) => {
                            return item.url === combineResources[i].url
                        });
                        // Make sure unique URL
                        if (foundIndex === -1) {
                            this.toDownload.push(combineResources[i]);
                        } else {
                            // If the new one have content, replace with old one anyway
                            let j = i;
                            combineResources[j].getContent((body) => {
                                if (!!body) {
                                    this.toDownload[foundIndex] = combineResources[j];
                                }
                            });
                        }
                    }
                }
            } else {
                for (let i = 0; i < combineResources.length; i++) {
                    if (!combineResources[i].url.includes('Chrome/Default/Extensions')) {
                        // Matching with current snippet URL
                        //TODO 同源的才能下载吗？
                        if (!domain || !this.isCurrentDomain || (this.isCurrentDomain && combineResources[i].url.indexOf('://' + domain) >= 0)) {
                            let foundIndex = this.toDownload.findIndex((item) => {
                                return item.url === combineResources[i].url
                            });
                            // Make sure unique URL
                            if (foundIndex === -1) {
                                this.toDownload.push(combineResources[i]);
                            } else {
                                // If the new one have content, replace with old one anyway
                                let j = i;
                                combineResources[j].getContent((body) => {
                                    if (!!body) {
                                        this.toDownload[foundIndex] = combineResources[j];
                                    }
                                });
                            }
                        }
                    }
                }
            }

            console.log('Combine Resource: ', combineResources);
            console.log('Download List: ', this.toDownload);

            for (let key in this.noContentReqs) {
                let url = this.noContentReqs[key]
                if (!this.reqs[url]) {
                    let _this = this
                    chrome.downloads.download({
                        url: url, //currentURL.url
                        filename: 'delay_resources/' + _this.getFileNameExt(url),
                        saveAs: false
                    }, () => {
                    })
                }
            }

            // window.alll = toDownload;
            // this.toDownload.forEach(d=>{
            //     console.log(d.url,6666666)
            // })
            if (this.isCheckHAR) {
                // No need to turn off notification for only one zip file
                try {
                    chrome.downloads.setShelfEnabled(true);
                } catch (e) {
                    console.error(e)
                }

                this.downloadZipFile(this.toDownload, () => {
                    this.allDone()
                }, selectItems);
            } else {
                this.downloadListWithThread(this.toDownload, this.downloadThread, () => {
                    this.allDone()
                }, selectItems);
            }
        });
    },
    filter(resources) {
        return resources.filter((item) => {
            return !(item.url.startsWith('webpack') || item.url.startsWith('chrome') || item.type === 'sm-script')
        })
    },
    downloadListWithThread(toDownload, threadCount, callback, selectItems) {
        let currentList = toDownload.slice(0, threadCount);
        let restList = toDownload.slice(threadCount);
        this.downloadURLs(currentList, () => {
            if (currentList.length > 0 && restList.length > 0) {
                this.downloadListWithThread(restList, threadCount, callback, selectItems);
            } else {
                callback();
            }
        }, selectItems);
    },
    resolveURLToPath(cUrl, cType, cContent) {
        let filepath, filename, isDataURI;
        let foundIndex = cUrl.search(/\:\/\//);
        // Check the url whether it is a link or a string of text data
        if ((foundIndex === -1) || (foundIndex >= 10)) {
            isDataURI = true;
            console.log('Data URI Detected!!!!!');

            if (cUrl.indexOf('data:') === 0) {
                let dataURIInfo = cUrl.split(';')[0].split(',')[0].substring(0, 30).replace(/[^A-Za-z0-9]/g, '.');
                // console.log('=====> ',dataURIInfo);
                filename = dataURIInfo + '.' + Math.random().toString(16).substring(2) + '.txt';
            } else {
                filename = 'data.' + Math.random().toString(16).substring(2) + '.txt';
            }

            filepath = '_DataURI/' + filename;
        } else {
            isDataURI = false;
            if (cUrl.split('://')[0].includes('http')) {
                // For http:// https://
                filepath = cUrl.split('://')[1].split('?')[0];
            } else {
                // For webpack:// ng:// ftp://
                filepath = cUrl.replace('://', '---').split('?')[0];
            }
            if (filepath.charAt(filepath.length - 1) === '/') {
                filepath = filepath + 'index.html';
            }
            filename = filepath.substring(filepath.lastIndexOf('/') + 1);
        }

        // Get Rid of QueryString after ;
        filename = filename.split(';')[0];
        filepath = filepath.substring(0, filepath.lastIndexOf('/') + 1) + filename;

        // Add default extension to non extension filename
        if (filename.search(/\./) === -1) {
            let haveExtension = null;
            if (cType && cContent) {
                // Special Case for Images with Base64
                if (cType.indexOf('image') !== -1) {
                    if (cContent.charAt(0) == '/') {
                        filepath = filepath + '.jpg';
                        haveExtension = 'jpg';
                    }
                    if (cContent.charAt(0) == 'R') {
                        filepath = filepath + '.gif';
                        haveExtension = 'gif';
                    }
                    if (cContent.charAt(0) == 'i') {
                        filepath = filepath + '.png';
                        haveExtension = 'png';
                    }
                }
                // Stylesheet | CSS
                if (cType.indexOf('stylesheet') !== -1 || cType.indexOf('css') !== -1) {
                    filepath = filepath + '.css';
                    haveExtension = 'css';
                }
                // JSON
                if (cType.indexOf('json') !== -1) {
                    filepath = filepath + '.json';
                    haveExtension = 'json';
                }
                // Javascript
                if (cType.indexOf('javascript') !== -1) {
                    filepath = filepath + '.js';
                    haveExtension = 'js';
                }
                // HTML
                if (cType.indexOf('html') !== -1) {
                    filepath = filepath + '.html';
                    haveExtension = 'html';
                }

                if (!haveExtension) {
                    filepath = filepath + '.html';
                    haveExtension = 'html';
                }
            } else {
                // Add default html for text document
                filepath = filepath + '.html';
                haveExtension = 'html';
            }
            filename = filename + '.' + haveExtension;
            console.log('File without extension: ', filename, filepath);
        }

        // Remove path violation case
        filepath = filepath
            .replace(/\:|\\|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')
            .replace(/\/\//g, '/')
            .replace(/(\s|\.)\//g, '/')
            .replace(/\/(\s|\.)/g, '/');

        filename = filename
            .replace(/\:|\\|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')

        // Decode URI
        if (filepath.indexOf('%') !== -1) {
            try {
                filepath = decodeURIComponent(filepath);
                filename = decodeURIComponent(filename);
            } catch (err) {
                console.log(err);
            }
        }

        // Strip double slashes
        while (filepath.includes('//')) {
            filepath = filepath.replace('//', '/');
        }

        // Strip the first slash '/src/...' -> 'src/...'
        if (filepath.charAt(0) === '/') {
            filepath = filepath.slice(1);
        }

        //  console.log('Save to: ', filepath);
        //  console.log('File name: ',filename);

        return {
            path: filepath,
            name: filename,
            dataURI: isDataURI && cUrl
        }
    },
    setOutputFilename(filepath, currentURL, selectItems) {
        // sendMessage(filepath + ' '+JSON.stringify(currentURL))
        let filename = (this.filename ? this.filename : this.defaultFilename)
        if (this.isTimestamp) {
            filename += '_' + this.timestamp
        }
        // sendMessage(filename)
        this.component.downInfo.filename = filename
        if (this.isResourcesType) {
            filename += '/' + currentURL.type + '/' + this.getFileNameExt(filepath)
        } else {
            filename += '/' + filepath
        }

        if (selectItems && selectItems.length === 1) {
            filename = this.getFileNameExt(currentURL.url)
        }
        return filename
    },
    downloadURLs(urls, callback, selectItems) {
        let currentDownloadQueue = [];
        urls.forEach((currentURL, index) => {
            console.log('Current request: ', currentURL);
            let cUrl = currentURL.url;
            let cType = currentURL.type;
            let resolvedURL = this.resolveURLToPath(cUrl);

            var filepath = resolvedURL.path;
            var filename = resolvedURL.name;

            console.log('Save to: ', filepath);

            currentDownloadQueue.push({
                index: index,
                url: cUrl,
                resolved: false
            });

            if (this.isCheckCache && currentURL.getContent) {
                currentURL.getContent((content, encoding) => {
                    var currentEnconding = encoding;
                    if (filename.search(/\.(png|jpg|jpeg|gif|ico|svg)/) !== -1) {
                        currentEnconding = 'base64';
                    }

                    var currentContent, finalURI;

                    if (resolvedURL.dataURI) {
                        currentContent = content;
                        finalURI = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(resolvedURL.dataURI);
                    } else {
                        currentContent = currentEnconding ? content : (function () {
                            try {
                                return btoa(content);
                            } catch (err) {
                                console.log('utoa fallback: ', currentURL.url);
                                return btoa(unescape(encodeURIComponent(content)));
                            }
                        })(); //btoa(unescape(encodeURIComponent(content)))

                        finalURI = 'data:text/plain;base64,' + currentContent;
                    }
                    try {
                        chrome.downloads.download({
                                url: finalURI, //currentURL.url
                                filename: this.setOutputFilename(filepath, currentURL, selectItems),
                                saveAs: false
                            },
                            (downloadId) => {
                                let currentIndex = currentDownloadQueue.findIndex((item) => {
                                    return item.index === index
                                });
                                if (chrome.runtime.lastError) {
                                    console.log('URI ERR: ', chrome.runtime.lastError, filepath); // , filepath, finalURI
                                    // document.getElementById('status').innerHTML = 'Files to download: ERR occured';
                                    currentDownloadQueue[currentIndex].resolved = true;
                                    resolveCurrentDownload();
                                    this.component.downInfo.error.push(currentURL.url)
                                } else {
                                    this.component.downInfo.success.push(currentURL.url)
                                    currentDownloadQueue[currentIndex].id = downloadId;
                                    currentDownloadQueue[currentIndex].order = currentIndex;
                                    //console.log('Create: ', JSON.stringify(currentDownloadQueue));
                                    //console.log(currentDownloadQueue);
                                    //chrome.downloads.search({
                                    //  id: downloadId
                                    //}, function (item) {
                                    //  //console.log(item[0].state);
                                    //})
                                }
                            }
                        );
                    } catch (runTimeErr) {
                        console.log(runTimeErr)
                    }
                });
            } else {
                try {
                    chrome.downloads.download({
                            url: currentURL.url,
                            filename: this.setOutputFilename(filepath, currentURL, selectItems),
                            saveAs: false
                        },
                        (downloadId) => {
                            let currentIndex = currentDownloadQueue.findIndex((item) => {
                                return item.index === index
                            });
                            if (chrome.runtime.lastError) {
                                console.log('URL ERR: ', chrome.runtime.lastError, filepath); // , filepath, finalURI
                                // document.getElementById('status').innerHTML = 'Files to download: ERR occured';
                                currentDownloadQueue[currentIndex].resolved = true;
                                resolveCurrentDownload();
                            } else {
                                currentDownloadQueue[currentIndex].id = downloadId;
                                currentDownloadQueue[currentIndex].order = currentIndex;
                                //console.log('Create: ', JSON.stringify(currentDownloadQueue));
                                //console.log(currentDownloadQueue);
                                //chrome.downloads.search({
                                //  id: downloadId
                                //}, function (item) {
                                //  //console.log(item[0].state);
                                //})
                            }
                        }
                    );
                } catch (runTimeErr) {
                    console.log(runTimeErr);
                }
            }

        });

        const resolveCurrentDownload = () => {
            var count = currentDownloadQueue.filter((item) => {
                return item.resolved === true
            }).length;
            //console.log('Count: ', count, '---', urls.length);
            if (count === urls.length) {
                //console.log('Callback');
                currentDownloadQueue = [];
                callback();
            }
        };

        chrome.downloads.onChanged.addListener((downloadItem) => {
            let index = currentDownloadQueue.findIndex((item) => {
                return item.id === downloadItem.id
            });
            if (index >= 0 && downloadItem.state) {
                //console.log(downloadItem.state.current);
                if (downloadItem.state.current === 'complete') {
                    chrome.downloads.search({
                        id: downloadItem.id
                    }, function (item) {
                        // sendMessage(downloadItem)
                        chrome.downloads.erase({
                            id: downloadItem.id
                        }, function () {
                            let newListUrl = currentDownloadQueue.find(function (item) {
                                return item.id === downloadItem.id
                            }).url;

                            if (newListUrl.indexOf('data:') === 0) {
                                newListUrl = 'DATA URI CONTENT';
                            }
                            currentDownloadQueue[index].resolved = true;
                            resolveCurrentDownload();
                        });
                    });
                } else if (downloadItem.state.current === 'interrupted') {
                    chrome.downloads.search({
                        id: downloadItem.id
                    }, function (item) {
                        chrome.downloads.erase({
                            id: downloadItem.id
                        }, function () {
                            currentDownloadQueue[index].resolved = true;
                            resolveCurrentDownload();
                        });
                    });
                }
            }
        });
    },
    chromeDownload(url, callback,filename="screenshot") {
        try {
            if (this.isTimestamp) {
                filename += '_' + Date.now()
            }
            chrome.downloads.download({
                    url: url,
                    filename: `${filename}.jpg`,
                    saveAs: false
                }, () => {
                    callback && callback()
                    this.allDone(true)
                }
            );
        } catch (runTimeErr) {
            callback && callback()
            this.allDone()
            console.log(runTimeErr)
        }
    },
    allDone(isSuccess) {
        // Default value
        if (typeof isSuccess === 'undefined') {
            isSuccess = true;
        }

        // Downloading flag
        this.component.isDownloading = false;
        // Re-enable Download notification
        try {
            chrome.downloads.setShelfEnabled(true);
        } catch (e) {
            console.error(e)
        }

        // Push reportElement to debugElement
        // Report in the end
        if (isSuccess) {
            // console.log(this.zipSize,666666)
            this.zipSize = 0
            if (this.isOpenFolder) {
                chrome.downloads.showDefaultFolder()
            }
            // if(this.isNotification){
            //     this.notification()
            // }
            this.component.downInfo.endTime = Date.now()
            this.component.downInfo.isSuccess = true
        } else {
            this.component.downInfo.isSuccess = false
        }
        if (this.isNotification) {
            this.component.allDone()
        }
    },
    notification() {
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: 'logo.png',
            title: '提示',
            message: '下载成功'
        });
    },
    downloadZipFile(toDownload, callback, selectItems) {
        if (zip) {
            zip.workerScriptsPath = "zip/";
            this.getAllToDownloadContent(toDownload, (result) => {
                // console.log('All ToDownload: ',result);
                // window.alll = result;
                //Double check duplicated
                var newResult = [];
                result.forEach((item) => {
                    if (newResult.findIndex(i => i.url === item.url) === -1) {
                        newResult.push(item);
                    } else {
                        // console.log('Final Duplicated: ', item.url);
                    }
                });
                if (selectItems && selectItems.length === 1) {
                    result[0].url = this.getFileNameExt(result[0].url)
                }
                // sendMessage(result)
                // newResult.forEach(d=>{
                //     console.log(d.url,7777)
                // })
                this.component.downInfo.success = newResult
                zip.createWriter(new zip.BlobWriter(), (blobWriter) => {
                    this.addItemsToZipWriter(blobWriter, newResult, () => {
                        this.downloadCompleteZip(blobWriter, callback, selectItems)
                    });
                }, (err) => {
                    console.error('ERROR: ', err.message, err.stack);
                    throw err
                    // Continue on Error, error might lead to corrupted zip, so might need to escape here
                    callback(false);
                });
            });
        } else {
            callback(false);
        }
    },
    getAllToDownloadContent(toDownload, callback) {
        // Prepare the file list for adding into zip
        let result = [];
        let pendingDownloads = toDownload.length;

        toDownload.forEach((item, index) => {
            // console.log(item.isStream,item,7777777,item.url)
            if (item.getContent && !item.isStream) {
                // Give timeout of 5000ms for the callback,
                // if the getContent callback cannot return in time, we move on
                var getContentTimeout = setTimeout(() => {
                    pendingDownloads--;
                    // Callback when all done
                    if (pendingDownloads === 0) {
                        callback(result);
                    }
                }, this.timeout * 1000);

                item.getContent((body, encode) => {
                    // Cancel the timeout above
                    clearTimeout(getContentTimeout);

                    // console.log(index,': ',encode,'---->',body ? body.substring(0,20) : null);
                    let resolvedItem = this.resolveURLToPath(item.url, item.type, body);
                    let newURL = resolvedItem.path;
                    let filename = resolvedItem.name;
                    let currentEnconding = encode || null;

                    if (filename.search(/\.(png|jpg|jpeg|gif|ico|svg)/) !== -1) {
                        currentEnconding = 'base64';
                    }

                    if (resolvedItem.dataURI) {
                        currentEnconding = null;
                    }

                    // Make sure the file is unique, otherwise exclude
                    let foundIndex = result.findIndex((currentItem) => {
                        return currentItem.url === newURL;
                    });

                    // Only add to result when the url is unique
                    if (foundIndex === -1) {
                        result.push({
                            name: filename,
                            type: item.type || 'text/plain',
                            originalUrl: item.url,
                            url: newURL, // Actually the path
                            content: resolvedItem.dataURI || body,
                            encoding: currentEnconding
                        });
                    } else {
                        // console.log('XXX: ',newURL, item.url);
                        // Otherwise add suffix to the path and filename
                        let newFilename = filename.split('.')[0] + '-' + Math.random().toString(16).substring(2) + '.' + filename.split('.')[1];
                        let newPath = newURL.toString().replace(filename, newFilename);
                        console.log('Duplicated: ', newFilename, newPath, filename, newURL);
                        // console.log(filename + ' ------- ' + newURL);
                        result.push({
                            name: newFilename,
                            type: item.type || 'text/plain',
                            originalUrl: item.url,
                            url: newPath,
                            content: resolvedItem.dataURI || body,
                            encoding: currentEnconding
                        });
                    }

                    // Update status bar

                    pendingDownloads--;

                    // Callback when all done
                    if (pendingDownloads === 0) {
                        // window.alll = result;
                        callback(result);
                    }

                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError);
                    }
                });
            } else {
                pendingDownloads--;
                // Callback when all done
                if (pendingDownloads === 0) {
                    callback(result);
                }
            }
        });
    },
    downloadCompleteZip(blobWriter, callback, selectItems) {
        blobWriter.close((blob) => {
            chrome.tabs.get(
                chrome.devtools.inspectedWindow.tabId, (tab) => {
                    let url = new URL(tab.url);
                    let filename = url.hostname ? url.hostname.replace(/([^A-Za-z0-9\.])/g, "_") : this.defaultFilename;
                    if (this.filename) {
                        filename = this.filename
                    }
                    if (this.isTimestamp) {
                        filename += '_' + this.timestamp
                    }
                    if (selectItems && selectItems.length === 1) {
                        filename = this.getFileName(selectItems[0].url)
                    }
                    this.component.downInfo.filename = filename
                    let a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = filename + '.zip';
                    a.click();
                    callback(true);
                });
        })
    },
    getFileName(url) {
        return this.getFileNameExt(url).split('.')[0]
    },
    getFileNameExt(url) {
        return url.substring(url.lastIndexOf('/') + 1)
    },
    addItemsToZipWriter(blobWriter, items, callback) {
        let item = items[0];
        let rest = items.slice(1);

        // if item exist so add it to zip
        if (item) {
            // Try to beautify JS,CSS,HTML here
            if (js_beautify &&
                html_beautify &&
                css_beautify &&
                this.isCheckBeautify &&
                item.name &&
                item.content
            ) {
                let fileExt = item.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/);
                switch (fileExt ? fileExt[1] : '') {
                    case 'js': {
                        console.log(item.name, ' will be beautified!');
                        item.content = js_beautify(item.content);
                        break;
                    }
                    case 'html': {
                        console.log(item.name, ' will be beautified!');
                        item.content = html_beautify(item.content);
                        break;
                    }
                    case 'css': {
                        console.log(item.name, ' will be beautified!');
                        item.content = css_beautify(item.content);
                        break;
                    }
                }
            }

            // Check whether base64 encoding is valid
            if (item.encoding === 'base64') {
                // Try to decode first
                try {
                    var tryAtob = atob(item.content);
                } catch (err) {
                    console.log(item.url, ' is not base64 encoding, try to encode to base64.');
                    try {
                        item.content = btoa(item.content);
                    } catch (err) {
                        console.log(item.url, ' failed to encode to base64, fallback to text.');
                        item.encoding = null;
                    }
                }
            }

            // Create a reader of the content for zip
            var resolvedContent = (item.encoding === 'base64') ?
                new zip.Data64URIReader(item.content || '') :
                new zip.TextReader(item.content || 'No Content: ' + item.originalUrl);

            var isNoContent = !item.content;


            // Create a Row of Report Table

            // Make sure the file has some byte otherwise no import to avoid corrupted zip
            resolvedContent.init(() => {
                // console.log(item.url,item,8888888,resolvedContent.size,666)
                if (resolvedContent.size > 0) {
                    if (!isNoContent) {

                        console.log(resolvedContent.size, item.encoding || 'No Encoding', item.url, item.name);
                        if (!this.zipSize) {
                            this.zipSize = 0
                        }
                        this.zipSize += resolvedContent.size
                        blobWriter.add(item.url, resolvedContent,
                            () => {
                                // On Success, to the next item
                                this.addItemsToZipWriter(blobWriter, rest, callback);

                                // Update Status

                                // Update Report Table
                            },
                            () => {
                                // On Progress
                            }
                        );
                    } else {
                        if (this.isCheckContent) {
                            blobWriter.add(item.url, resolvedContent,
                                () => {
                                    // On Success, to the next item
                                    this.addItemsToZipWriter(blobWriter, rest, callback);

                                    // Update Status

                                    // Update Report Table
                                },
                                () => {
                                    // On Progress
                                }
                            );
                        } else {
                            console.log('EXCLUDED: ', item.url);
                            // console.log(item,888888)
                            // Update Status

                            // Update Report Table

                            // To the next item
                            this.addItemsToZipWriter(blobWriter, rest, callback);
                        }
                    }
                } else {
                    // console.log(item,66666666)
                    // If no size, exclude the item
                    console.log('EXCLUDED: ', item.url);

                    // Update Status

                    // To the next item
                    this.addItemsToZipWriter(blobWriter, rest, callback);
                }
            });

        } else {
            // Callback when all done
            callback();
        }
        return rest;
    },
    reload() {
        utils.resetResourceCollector()
        chrome.tabs.reload(chrome.devtools.inspectedWindow.tabId, null, function () {
        });
    },
    getXHRs(callback) {
        this.component.isDownloading = true
        this.toDownload = []
        let xhrResources = [];
        let reqs = this.reqs
        if (this.isCheckXHR) {
            chrome.devtools.network.getHAR((logInfo) => {
                // console.log(1111,logInfo)
                logInfo.entries.map((entry) => {
                    if (this.reqs[entry.request.url]) {
                        console.log('Found in Resource Collector: ', entry.request.url);
                        xhrResources.push(Object.assign({}, entry.request, {
                            getContent: function (cb) {
                                cb(reqs[entry.request.url].body, reqs[entry.request.url].encoding);
                                return true;
                            },
                            type: entry.response.content.mimeType || 'text/plain',
                            isStream: false
                        }));
                    } else {
                        xhrResources.push(Object.assign({}, entry.request, {
                            getContent: entry.getContent,
                            type: entry.response.content.mimeType || 'text/plain',
                            isStream: (entry.response.content.mimeType || '').indexOf('event-stream') !== -1
                        }));
                    }
                });
                // sendMessage(xhrResources)
                callback(xhrResources);
            });
        } else {
            callback(xhrResources);
        }
    },
    processContentFromResources(combineResources, cb) {
        let count = 0;
        combineResources.forEach((item, index) => {
            // sendMessage(item)
            // Give timeout of 5000ms for the callback,
            // if the getContent callback cannot return in time, we move on
            let getContentTimeout = setTimeout(function () {
                count++;
                // Callback when all done
                if (count === combineResources.length) {
                    cb(combineResources);
                }
            }, this.timeout * 1000);
            item.getContent(function (body, encoding) {
                clearTimeout(getContentTimeout);
                combineResources[index].getContent = function (cb) {
                    cb(body, encoding);
                };
                count++;
                if (count === combineResources.length) {
                    cb(combineResources);
                }
            });
        })
    }
}
export default utils

function sendMessageToContentScript(message, callback) {
    // chrome.tabs.getSelected(tab=>{
    //     chrome.tabs.sendMessage(tab.id, message, function (response) {
    //         if (callback) callback(response);
    //     });
    // })
    try {
        // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        //     if(!tabs){
        //         return
        //     }
        chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, message, function (response) {
            if (callback) callback(response);
        });
        // });
    } catch (e) {
        console.error(e)
    }

}

window.sendMessage = (message) => {
    console.log(message)
    return
    //调试用
    sendMessageToContentScript({from: 'devtools', message: message}, function (response) {
    });
}

// window.onerror = (e) => {
//     sendMessage(e.message + " " + e.stack)
// }
