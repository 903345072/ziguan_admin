<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" :placeholder="$t('heyue.username')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column :label="$t('table.id')" prop="id"  align="center" width="100px" >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.member.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('recharge.amount')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('recharge.add_time')" prop="add_time" width="200px" align="center" sortable="custom" :class-name="getSortClass('add_time')">
        <template slot-scope="scope">
          <span>{{ scope.row.add_time }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('recharge.type')" prop="add_time" width="200px" align="center" >
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('heyue.state')" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state | cnStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('recharge.recharge_state')" align="center" min-width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.state == -1" size="mini" :type="'success'" @click="handleModifyStatus(row,1,'published')">
            通过
          </el-button>
          <el-button v-if="row.state == -1" size="mini" :type="'danger'" @click="handleModifyStatus(row,2,'published')">
            拒绝
          </el-button>
          <el-button v-if="row.state != -1" size="mini" :type="row.state | statusFilter ">
            {{ row.state | cnStatus }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page-sizes="[10,20,50]" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, updateRechargeState } from '@/api/recharge'
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
        '-1': '未审核',
        '0': '未支付',
        '1': '已支付',
        '2': '已拒绝'
      }
      return statusMap_[status]
    },
    typeName(status) {
      const statusMap_ = {
        '1': '微信',
        '2': '支付宝',
        '3': '银行卡',
        '4': '系统入金'
      }
      return statusMap_[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      checkedroles: [],
      isIndeterminate: true,
      checkAll: false,
      roles: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        username: undefined,
        sort: '-add_time',
        state: undefined
      },
      importanceOptions: [-1, 0, 1, 2],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+add_time' }, { label: 'ID Descending', key: '-add_time' }],
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
      if (prop === 'add_time') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+add_time'
      } else {
        this.listQuery.sort = '-add_time'
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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
