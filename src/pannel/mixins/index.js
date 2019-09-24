import utils from '../../utils'
export default {
    data(){
        return {
            tableHeight:window.innerHeight
        }

    },
    filters:{
        name(value){
            return value.substring(value.lastIndexOf('/')+1).split('?')[0]
        },
        decode(value){
            return decodeURIComponent(value)
        },
        size(value){
            // sendMessage(value)
            if(!value.width)return
            return value.width + 'x' + value.height
        }
    },
    methods: {
        openWindow(scope){
            utils.preview(scope.row.url)
            // utils.openWindow(scope.row.url)
        },
    },
    mounted() {
        this.resize= ()=>{
            this.tableHeight = window.innerHeight - this.$refs.container.getBoundingClientRect().y //-this.$refs.top.getBoundingClientRect().height
        }
        setTimeout(()=>{
            this.resize()
        },200)

        window.addEventListener('resize',this.resize)
    },
    beforeDestroy() {
        window.removeEventListener('resize',this.resize)
    }
}
