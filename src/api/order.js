import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/order/getAll',
    method: 'get',
    params: query
  })
}

export function updateMemberOrder(data) {
  return request({
    url: '/order/updateMemberOrder',
    method: 'post',
    data
  })
}

export function updateRechargeState(data) {
  return request({
    url: '/recharge/updateState',
    method: 'post',
    data
  })
}

