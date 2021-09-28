<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" :placeholder="$t('heyue.username')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-select v-model="listQuery.apply_state" :placeholder="$t('heyue.state')" clearable style="width: 90px" class="filter-item">
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
      累计利息:<span style="color:red">{{member_interest}}</span>
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
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="60px" :class-name="getSortClass('apply_time')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.username')" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约余额" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.total_capital }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.deposit')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.deposit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约总资产" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.market_value }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.leverage_money')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.leverage_money }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.loss_warning_line')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.loss_warning_line }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.loss_sell_line')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.loss_sell_line }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约盈亏" class-name="status-col" width="100px">
        <template slot-scope="scope">
          <span>{{ (scope.row.market_value - scope.row.deposit - scope.row.leverage_money).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.repare_capital')" width="100pxpx" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.repare_capital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apply_time }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="430" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="操盘金额" prop="total_capital" :rules="[{ required: true, message: '请输入操盘金额', trigger: 'blur' }]">
          <el-input v-model="temp.total_capital" />
        </el-form-item>
        <el-form-item label="保证金" prop="deposit" :rules="[{ required: true, message: '保证金', trigger: 'blur' }]">
          <el-input v-model="temp.deposit" />
        </el-form-item>
        <el-form-item label="配资金额" prop="leverage_money" :rules="[{ required: true, message: '请输入配资金额', trigger: 'blur' }]">
          <el-input v-model="temp.leverage_money" />
        </el-form-item>
        <el-form-item label="平仓预警线" prop="loss_warning_line" :rules="[{ required: true, message: '请输入平仓预警线', trigger: 'blur' }]">
          <el-input v-model="temp.loss_warning_line" />
        </el-form-item>
        <el-form-item label="平仓线" prop="loss_sell_line" :rules="[{ required: true, message: '请输入平仓线', trigger: 'blur' }]">
          <el-input v-model="temp.loss_sell_line" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
    <pagination v-show="total>0" :total="total" :page-sizes="[10,20,50]" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, createHeYue, updateHeYueStatus, updateMemberHeYue } from '@/api/Member'
import waves from '@/directive/waves' // waves directive
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
    numFilter(number) {
      var times = Math.pow(10, 2)
      var roundNum = Math.round(number * times) / times
      return roundNum.toFixed(2)
    },
    statusFilter(status) {
      const statusMap = {
        0: 'primary',
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return statusMap[status]
    },
    cnStatus(status) {
      const statusMap_ = {
        0: '申请中',
        1: '有效',
        2: '已过期',
        3: '已拒绝',
        4: '已关闭'
      }
      return statusMap_[status]
    },
    opStatus(status) {
      const statusMap_ = {
        0: '通过',
        1: '恢复'
      }
      return statusMap_[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      member_interest: 0,
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
        admin_username: undefined,
        page: 1,
        limit: 10,
        username: undefined,
        sort: '-apply_time',
        apply_state: undefined
      },
      importanceOptions: [0, 1, 2, 3, 4],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+apply_time' }, { label: 'ID Descending', key: '-apply_time' }],
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
        this.member_interest = response.data.member_interets
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, state) {
      updateHeYueStatus({ id: row.id, apply_state: state }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.apply_state = state
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'apply_time') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+apply_time'
      } else {
        this.listQuery.sort = '-apply_time'
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
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createHeYue(this.temp).then((res) => {
            this.temp.id = res.data.id
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
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
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateMemberHeYue(tempData).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '更新成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
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
