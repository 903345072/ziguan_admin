<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.nickname" :placeholder="$t('heyue.username')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.admin_username" :placeholder="$t('order.dl_name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker
        v-model="listQuery.start_time"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm"
        placeholder="选择起始时间">
      </el-date-picker>
      <el-date-picker
        v-model="listQuery.end_time"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm"
        placeholder="选择截止时间">
      </el-date-picker>
      <el-select v-model="listQuery.state" :placeholder="$t('heyue.state')" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item | cnStatus" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
    </div>
    <div style="margin-bottom: 15px">
        印花税累计:<span style="color:red">{{yh_fees}}</span>
        手续费税累计:<span style="color:red">{{sx_fees}}</span>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.nickname')" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.dl_name')" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member.p_admin.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.contract_no')" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.contract_no }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.stock_code')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stock_code }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.stock_name')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stock_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.member_id')" prop="make_order_date" width="50px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member_id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.make_order_date')" prop="make_order_date" width="120px" align="center" sortable="custom" :class-name="getSortClass('make_order_date')">
        <template slot-scope="scope">
          <span>{{ scope.row.make_order_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成交价" prop="make_order_date" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.buy_price }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.trade_direction')" prop="make_order_date" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.trade_direction | directionFilter }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="合约id" prop="make_order_date" min-width="50px" align="center">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ scope.row.member_heyue_id}}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column :label="$t('order.buy_hand')" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.trade_hand }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.entrust_way')" prop="make_order_date" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.entrust_way | weituoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态说明" prop="make_order_date" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stock_status | stockStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.ping_way')" prop="make_order_date" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ping_way | pingFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="券商编号" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.broker_id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.cancel_status')" prop="make_order_date" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cancel_status | cancelFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.sx_fee')" prop="make_order_date" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sx_fee }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.yh_fee')" prop="make_order_date" min-width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.yh_fee }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page-sizes="[10,20,50]" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, updateRechargeState } from '@/api/order'
import waves from '@/directive/waves' // waves directive1
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    directionFilter(status) {
      const a = {
        '1': '买',
        '2': '卖'
      }
      return a[status]
    },
    weituoFilter(status) {
      const a = {
        '1': '限价委托',
        '2': '市价委托'
      }
      return a[status]
    },
    stockStatusFilter(status) {
      const a = {
        '1': '委托中',
        '2': '已成交',
        '3': '已撤单',
        '4': '已成交',
        '5': '部撤'
      }
      return a[status]
    },
    pingFilter(status) {
      const a = {
        '0': '否',
        '1': '是'
      }
      return a[status]
    },
    cancelFilter(status) {
      const a = {
        '0': '未撤销',
        '1': '申请撤销中',
        '2': '已撤销'
      }
      return a[status]
    },
    statusFilter(status) {
      const statusMap = {
        '-1': 'primary',
        '1': 'success',
        '2': 'warning'
      }
      return statusMap[status]
    },
    cnStatus(status) {
      const statusMap_ = {
        '1': '委托中',
        '2': '已成交',
        '3': '已撤销',
        '4': '已成交',
        '5': '部撤'
      }
      return statusMap_[status]
    },
    typeName(status) {
      const statusMap_ = {
        '1': '微信',
        '2': '支付宝',
        '3': '银行卡'
      }
      return statusMap_[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      yh_fees: 0,
      sx_fees: 0,
      checkedroles: [],
      isIndeterminate: true,
      checkAll: false,
      roles: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        start_time: undefined,
        end_time: undefined,
        page: 1,
        limit: 10,
        nickname: undefined,
        admin_username: undefined,
        sort: '-make_order_date',
        state: undefined,
        order_pid: 1
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+make_order_date' }, { label: 'ID Descending', key: '-make_order_date' }],
      statusOptions: [0, 1],
      showReviewer: false,
      temp: {
        id: undefined,
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getcheckedroles(roles_) {
      var arr_ = []
      roles_.forEach(function(k, v) {
        arr_.push(k['id'])
      })
      return arr_
    },
    handleCheckAllChange(val) {
      var arr = []
      if (val) {
        this.roles.forEach(function(k, v) {
          arr.push(k['id'])
        })
      }
      this.checkedroles = val ? arr : []
      this.isIndeterminate = false
    },
    handleCheckedrolesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.roles.length
      this.checkedroles = value
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.count[0]
        this.yh_fees = response.data.fee.yh_fee
        this.sx_fees = response.data.fee.sx_fee
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, state) {
      updateRechargeState({ id: row.id, state: state }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.state = state
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'make_order_date') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+make_order_date'
      } else {
        this.listQuery.sort = '-make_order_date'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        status: 1,
        id: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.checkedroles = []
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', '创建时间', '用户名', '状态']
        const filterVal = ['id', 'created_at', 'username', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      console.log(key)
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
