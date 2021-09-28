import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/finace/getAll',
    method: 'get',
    params: query
  })
}

export function createHeYue(data) {
  return request({
    url: '/heyue/insertOneHeYue',
    method: 'post',
    data
  })
}

export function updateHeYue(data) {
  return request({
    url: '/heyue/updateHeYue',
    method: 'post',
    data
  })
}

export function updateWithdrawState(data) {
  return request({
    url: '/withdraw/updateState',
    method: 'post',
    data
  })
}
