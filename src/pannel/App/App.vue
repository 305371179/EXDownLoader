<template>
    <div class="main_app"
         v-loading.fullscreen.lock="isDownloading"
         element-loading-text="拼命下载中..."
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)"
    >
        <el-alert
                v-if="!isCloseAlert"
                title="多媒体资源必须播放了才能有效下载，没有播放的资源将会放到delay_resources文件夹里面"
                type="warning"
        @close="closeAlert">
        </el-alert>
        <div class="top-container">
            <h1>
                <el-tooltip class="item" effect="dark" content="点击去github查看源码，顺便给个星吧，^_^" placement="top-start">
                    <el-link class="title" @click="href">{{name}}</el-link>
                </el-tooltip>
            </h1>
            <div class="button-container">
                <el-tooltip class="item" effect="dark" content="在设置标签可以设置下载选项" placement="top-start">
                    <el-button type="primary" @click="saveAll" :loading="isDownloading&&isAll">下载所有资源({{resources |
                        resourcesFilter}})
                    </el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="必须至少选择一个资源" placement="top-start">
                    <el-button type="primary" plain @click="saveSelect" :loading="isDownloading&&isSelect">
                        下载选中资源({{selectResources.length}})
                    </el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="截取当前屏幕并自动下载" placement="top-start">
                    <el-button type="success" plain @click="capture" :loading="isCaptureLoading">截屏</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="如果资源没加载出来，请刷新一下，尤其是多媒体或者ajax的资源" placement="top-start">
                    <el-button type="success" @click="reload">刷新网页</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="如果面板报错或者没有响应请刷新一下" placement="top-start">
                    <el-button type="success" plain @click="refresh">刷新面板</el-button>
                </el-tooltip>
            </div>
        </div>

        <el-tabs v-model="activeName" class="tabs" lazy>
            <el-tab-pane label="设置" name="settings">
                <settings></settings>
            </el-tab-pane>
            <el-tab-pane :label="imagesLabel" name="images">
                <images :data="images" @change="change"></images>
            </el-tab-pane>
            <el-tab-pane :label="scriptsLabel" name="scripts">
                <Scripts :data="scripts" @change="change"></Scripts>
            </el-tab-pane>
            <el-tab-pane :label="documentsLabel" name="documents">
                <Documents :data="documents" @change="change"></Documents>
            </el-tab-pane>
            <el-tab-pane :label="mediasLabel" name="medias">
                <Medias :data="medias" @change="change"></Medias>
            </el-tab-pane>
            <el-tab-pane :label="xhrsLabel" name="xhrs">
                <Medias :data="xhrs" @change="change"></Medias>
            </el-tab-pane>
            <el-tab-pane :label="othersLabel" name="others">
                <Others :data="others" @change="change"></Others>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import utils from '../../utils'
    import Settings from '../components/settings'
    import Images from '../components/images'
    import Scripts from '../components/scripts'
    import Documents from '../components/documents'
    import Medias from '../components/medias'
    import Others from '../components/others'
    import {name, homepage_url} from '../../manifest.development'

    export default {
        components: {
            Settings,
            Images,
            Scripts,
            Documents,
            Medias,
            Others
        },
        name: 'app',
        data() {
            return {
                name,
                homepage_url,
                requests: [],
                resources: [],
                activeName: 'settings',
                isDownloading: false,
                isCaptureLoading: false,
                imagesSelect: [],
                scriptsSelect: [],
                documentsSelect: [],
                mediasSelect: [],
                xhrsSelect: [],
                othersSelect: [],
                isAll: false,
                isSelect: false,
                isCloseAlert: false,
                downInfo: {
                    isSuccess: true,
                    startTime: 0,
                    endTime: 0,
                    files: [],
                    success: [],
                    error: [],
                    filename: ''
                }
            }
        },
        created() {
            utils.created(this)
            utils.getStorage('closeAlert').then(value=>{
                if(value&&value.closeAlert){
                    this.isCloseAlert = true
                }
            })
        },
        watch: {
            isDownloading(val) {
                if (!val) {
                    this.isAll = false
                    this.isSelect = false
                }
            },
            resources: {
                deep: true,
                handler() {
                    let types = {}
                    this.resources.forEach(item => {
                        if (!types[item.type]) {
                            types[item.type] = item.type
                        }
                    })
                    // sendMessage(types)
                }
            }
        },
        mounted() {
        },
        filters: {
            resourcesFilter(value) {
                return utils.filter(value).length
            }
        },
        computed: {
            resourcesMessage() {
                let message = ''
                if (this.requests.length) {
                    message += `请求数：${this.requests.length}`
                }
                if (this.resources.length) {
                    message += message ? ' =========== ' : ''
                    message += `资源数： ${utils.filter(this.resources).length}`
                }
                return message
            },
            selectResources() {
                return [
                    ...this.imagesSelect,
                    ...this.scriptsSelect,
                    ...this.documentsSelect,
                    ...this.mediasSelect,
                    ...this.xhrsSelect,
                    ...this.othersSelect
                ]
            },
            images() {
                return utils.filter(this.resources.filter(item => {
                    return item.type === 'image'
                }))
            },
            imagesLabel() {
                let label = '图片'
                label += this.imagesSelect ? `（${this.imagesSelect.length}/${this.images.length})` : ''
                return label
            },
            scripts() {
                return utils.filter(this.resources.filter(item => {
                    return item.type === 'script'
                }))
            },
            scriptsLabel() {
                let label = '脚本'
                label += this.scriptsSelect ? `（${this.scriptsSelect.length}/${this.scripts.length})` : ''
                return label
            },
            documents() {
                return utils.filter(this.resources.filter(item => {
                    return item.type === 'document'
                }))
            },
            documentsLabel() {
                let label = '文档'
                label += this.documentsSelect ? `（${this.documentsSelect.length}/${this.documents.length})` : ''
                return label
            },
            medias() {
                return utils.filter(this.resources.filter(item => {
                    return item.type.indexOf('audio') !==-1 || item.type.indexOf('media') !==-1|| item.type.indexOf('video') !==-1
                }))
            },
            mediasLabel() {
                let label = '多媒体'
                label += this.mediasSelect ? `（${this.mediasSelect.length}/${this.medias.length})` : ''
                return label
            },
            xhrs() {
                return utils.filter(this.resources.filter(item => {
                    return item.type === 'xhr'
                }))
            },
            xhrsLabel() {
                let label = 'xhr'
                label += this.xhrsSelect ? `（${this.xhrsSelect.length}/${this.xhrs.length})` : ''
                return label
            },
            others() {
                return utils.filter(this.resources.filter(item => {
                    return item.type === 'other'
                }))
            },
            othersLabel() {
                let label = '其他'
                label += this.othersSelect ? `（${this.othersSelect.length}/${this.others.length})` : ''
                return label
            },
        },
        methods: {
            closeAlert(){
                utils.setStorage('closeAlert',true)
            },
            allDone() {
                let time = (this.downInfo.endTime - this.downInfo.startTime) / 1000
                this.$notify({
                    title: this.downInfo.isSuccess ? '下载成功' : '下载失败',
                    duration: 15000,
                    message: `
                                <div>文件名：${this.downInfo.filename}</div>
                                <div>耗时：${time}秒</div>
                                <div>文件数：${this.downInfo.files.length}</div>
                                <div>成功：${this.downInfo.success.length}</div>
                                <div>失败：${this.downInfo.error.length}</div>
                            `,
                    dangerouslyUseHTMLString: true,
                    type: this.downInfo.isSuccess ? 'success' : 'error'
                });
                this.downInfo = {
                    isSuccess: true,
                    startTime: 0,
                    endTime: 0,
                    files: [],
                    success: [],
                    error: [],
                    filename: ''
                }
            },
            href() {
                utils.openWindow(this.homepage_url)
            },
            capture() {
                this.isCaptureLoading = true
                utils.captureWindow(url => {
                    utils.chromeDownload(url, () => {
                        this.isCaptureLoading = false
                    })
                })
            },
            change(label, selects) {
                this[label + 'Select'] = selects
            },
            refresh() {
                window.location.reload(true)
            },
            reload() {
                utils.reload()
            },
            saveAll() {
                this.isAll = true
                utils.save()
            },
            saveSelect() {
                if (!this.selectResources.length) {
                    this.$message({
                        message: '请先选中要下载的资源',
                        type: 'warning'
                    });
                    return
                }
                this.isSelect = true
                utils.save(this.selectResources)
            },
        }
    }
</script>

<style>
    html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .main_app {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
    }

    .title {
        font-size: 30px;
        font-weight: bold;
    }

    .tabs {
        flex: 1;
    }

    .button-container {
        height: 40px;
        display: flex;
        justify-content: center;
        padding: 4px;
        align-items: center;
    }

    .top-container {
        text-align: center;
    }
    .el-alert__closebtn{
        top: 6px;
    }
</style>
