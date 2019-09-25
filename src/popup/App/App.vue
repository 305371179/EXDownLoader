<template>
    <el-card class="box-card">
        <div
                slot="header"
                class="clearfix"
        >
            <span class="title">{{name}}</span>
            <el-link type="success" class="link" @click="href">下载源码</el-link>
        </div>
        <div @click="show=true" >
            <el-tooltip class="item" effect="dark" content="点击显示二维码" placement="top-start">
                <div>
                    <div :style="{visibility:!show? 'visible':'hidden'}" class="desc" v-for="(d,index) in desc" :key="index">{{index+1}}、{{d}}</div>
                </div>
            </el-tooltip>

            <el-button size="medium" type="primary" v-clipboard:copy="url" class="capture" >复制链接</el-button>
            <el-button :loading="isQrcodeLoading" size="medium" type="primary" class="capture" style="margin-left: 0;margin-top: 10px;" @click="downQrcode">下载二维码</el-button>
            <el-button :loading="isCaptureLoading" size="medium" type="success" class="capture" style="margin-left: 0;margin-top: 10px;" @click="captureWindow">截屏</el-button>
        </div>


        <div class="dashangDiv" v-show="show" @click="show = false">
            <!--            <img src="../../assets/qrcode.jpg" alt="">-->

            <canvas
                    :style="{
      height: `${size}px`,
      width: `${size}px`
    }"
                    :height="size"
                    :width="size"
                    v-show="type === 'canvas'"
                    ref="canvas"></canvas>
            <img    style="position:relative;top:20px;"
                    :src="imgData"
                    v-if="type === 'img'"
            >
            <img class="mu-qrcode__logo" v-if="logo" :src="logo">
        </div>
    </el-card>
</template>

<script>
    import {name, homepage_url} from '../../manifest.development'
    import utils from "../../utils";
    import QRCodeImpl from 'qr.js/lib/QRCode'
    import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel'

    export default {
        name: 'app',
        data() {
            return {
                name,
                homepage_url,
                desc: [
                    `打开谷歌浏览器开发工具，在标签页中点击${name}标签`,
                    "在设置中自定义下载的配置",
                    "然后选择你想要下载的资源，点击相应的按钮即可",
                    "如果想自己开发一个这样的插件，可以点击看源码去github下载源码,记得不要忘记给星哦，^_^",
                    "qq：305371179，欢迎互相交流学习",
                ],
                show: true,
                imgData: '',
                size: 200,
                level: 'L',
                bgColor: '#ffffff',
                fgColor: '#000000',
                type: 'img',
                logo: '',
                url: '',
                isCaptureLoading: false,
                isQrcodeLoading: false
            }
        },
        mounted() {
            utils.getCurrentUrl(url =>{
                this.url = url
                this.render(url)
            })
        },
        methods: {
            downQrcode(){
                this.isQrcodeLoading = true
                let url = this.imgData
                utils.chromeDownload(url, () => {
                    this.isQrcodeLoading = false
                },'qrcode')
            },
            captureWindow(){
                this.isCaptureLoading = true
                utils.captureWindow(url => {
                    utils.chromeDownload(url, () => {
                        this.isCaptureLoading = false
                    })
                })
            },
            href() {
                utils.openWindow(this.homepage_url)
            },
            getBackingStorePixelRatio(ctx) {
                return (
                    ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio ||
                    1
                )
            },
            render(url) {
                if (typeof url === 'undefined') {
                    return
                }

                const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[this.level])
                qrcode.addData(url)
                qrcode.make()

                const canvas = this.$refs.canvas

                const ctx = canvas.getContext('2d')
                const cells = qrcode.modules
                const tileW = this.size / cells.length
                const tileH = this.size / cells.length
                const scale = (window.devicePixelRatio || 1) / this.getBackingStorePixelRatio(ctx)
                canvas.height = canvas.width = this.size * scale
                ctx.scale(scale, scale)

                cells.forEach((row, rdx) => {
                    row.forEach((cell, cdx) => {
                        ctx.fillStyle = cell ? this.fgColor : this.bgColor
                        const w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW))
                        const h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH))
                        ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h)
                    })
                })

                if (this.type === 'img') {
                    this.imgData = canvas.toDataURL('image/png')
                }
            }
        }
    }
</script>

<style>
    .box-card {
        width: 300px;
        height:500px;
        position: relative;
    }

    .box-card .title {
        font-weight: bold;
        font-size: 18px;
    }

    .link {
        float: right;
        font-size: 16px;
    }

    .desc {
        font-size: 16px;
        color: #222222;
        line-height: 1.5;
    }

    .capture {
        display: block;
        width:100%;
        margin-top: 38px;
    }

    .dashangDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 50px;
        /*bottom: 0;*/
        margin: auto;
    }

    .dashangDiv img {
        width: 90%;
        height: auto;
    }
</style>
