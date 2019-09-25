<template>
    <div class="container" ref="container">
        <el-table
                stripe
                :height="tableHeight"
                class="table"
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column
                    label="操作"
                    width="300">
                <template slot-scope="scope">
                    <el-button size="mini"  @click="download(scope)">下载</el-button>
                    <el-button size="mini"
                               v-clipboard:copy="scope.row.url"
                               v-clipboard:success="copySuccess"
                               v-clipboard:error="copyError"
                    >复制链接</el-button>
                    <el-button size="mini"  @click="openWindow(scope)">查看</el-button>
                </template>

            </el-table-column>
<!--            <el-table-column-->
<!--                    label="源码"-->
<!--                    width="120">-->
<!--                <el-button slot-scope="scope" @click="preview(scope)">源码</el-button>-->
<!--            </el-table-column>-->
            <el-table-column
                    prop="name"
                    label="名称"
                    width="120">
                <template slot-scope="scope">
                    {{ scope.row.url | name}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="address"
                    label="地址"
                    show-overflow-tooltip>
                <template slot-scope="scope">
                    {{ scope.row.url | decode}}
                </template>
            </el-table-column>
        </el-table>

<!--        <el-dialog title="查看源文件" :visible.sync="dialogVisible" @close="fileCode={}">-->
<!--            <div style="margin: 10px 20px;">-->
<!--                <codemirror ref="fileCode"-->
<!--                            :value="fileCode"-->
<!--                            :options="cmOption"-->
<!--                ></codemirror>-->
<!--            </div>-->
<!--            <div style="height:50px;">-->
<!--                <el-button @click="dialogVisible=false" type="primary" style="float:right;">退出</el-button>-->
<!--            </div>-->

<!--        </el-dialog>-->

    </div>
</template>

<script>
    import utils from "../../utils";
    import mixins from "../mixins";

    export default {
        name: "others",
        mixins:[mixins],
        props:{
            data:{
                type: Array,
                default(){
                    return []
                }
            }
        },
        watch: {
          data:{
              immediate: true,
              deep:true,
              handler(){
                  this.setTableData()
              }
          },
          // sizes:{
          //     deep: true,
          //     handler(){
          //         this.setTableData()
          //     }
          // }
        },
        computed:{
            urls(){
                let urls = []
                this.data.forEach(item=>{
                    urls.push(item.url)
                })
                return urls
            }
        },
        data(){
            return {
                multipleSelection: [],
                tableData: [],
                sizes:{},
                fileCode: '',
                dialogVisible: false,
                cmOption: {
                    // value: '<p>hello</p>',
                    // origLeft: null,
                    // orig: '<p>hello world</p>',
                    // connect: 'align',
                    mode: "javascript",
                    lineNumbers: true,
                    scrollbarStyle: null,
                    readOnly:true,
                    lineWiseCopyCut: true,
                    // collapseIdentical: false,
                    // highlightDifferences: true,
                    // theme: 'darcula',
                    line: true,
                }
            }
        },
        methods:{
            preview(scope){
                utils.preview(scope.row.url)
                /*scope.row.getContent(body=>{
                    this.fileCode = body
                })
                this.dialogVisible = true
                this.onCmReady(null,this.fileCode)*/
            },
            // onCmReady(event,code){
            //     if(!code)return
            //     if(code.row===undefined)return
            //     // console.log(this.$refs['code'+index].$el.querySelectorAll('.CodeMirror-line')[code.row])
            //     setTimeout(()=>{
            //         let parent = this.$refs['fileCode'].$el
            //         let targetRow =parent.querySelectorAll('.CodeMirror-line')[code.row]
            //         targetRow.style.background = '#afafaf'
            //         //寻找列
            //         if(!code.col)return
            //         let length =code.codeArray[code.row].length
            //         let rcode = code.codeArray[code.row].replace(/(^\s*)|(\s*$)/g, "")
            //         let col = code.col-(length-rcode.length)
            //         let char = rcode[col]
            //
            //         let spans = targetRow.querySelectorAll('span[class^="cm-"]')
            //         if(spans){
            //             let count =0
            //             let last = 0
            //             for(let item of spans){
            //                 let text = item.innerText
            //                 last = count
            //                 count+=text.length
            //                 if(count>=col){
            //                     let index = col-last-2
            //                     item.innerHTML= text.substr(0,index)+`<em style="color:red;font-weight: bolder;">${char}</em>`+text.substr(index+1)
            //                 }
            //             }
            //         }
            //     },0)
            //     // CodeMirror-line
            // },
            // openWindow(scope){
            //     utils.preview(scope.row.url)
            //     // utils.openWindow(scope.row.url)
            // },
            // copySuccess(){
            //     this.$message({
            //         type: 'success',
            //         message: '复制成功'
            //     })
            // },
            // copyError(){
            //     this.$message({
            //         type: 'error',
            //         message: '复制失败'
            //     })
            // },
            download(item){
                utils.save([item.row])
            },
            setTableData(){
                this.tableData = []
                this.data.forEach(item=>{
                    this.tableData.push({
                        ...item,
                        ...this.sizes[item.url]
                    })
                })

            },
            load(e,scope){
                this.sizes[scope.row.url] = {width: e.target.naturalWidth,height: e.target.naturalHeight}
                this.setTableData()
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                this.$emit('change','others',this.multipleSelection)
            }
        },
        mounted() {

        }
    }
</script>

<style scoped>
    .container{
        height:100%;
        /*overflow: hidden;*/
        overflow-y: auto;
    }
    .top{
        height:60px;
    }

</style>
<style>
    .CodeMirror{
        height: auto;
    }
    /*.scripts .el-icon-circle-close{*/
    /*    color:white;*/
    /*}*/
</style>
