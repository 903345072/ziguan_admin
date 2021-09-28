import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/member/getMemberHeYueApplyList',
    method: 'get',
    params: query
  })
}

export function fetchMemberList(query) {
  return request({
    url: '/member/getMemberList',
    method: 'get',
    params: query
  })
}

export function getMemberInterestList(query) {
  return request({
    url: '/member/getMemberInterestList',
    method: 'get',
    params: query
  })
}

export function createMember(data) {
  return request({
    url: '/member/createMember',
    method: 'post',
    data
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

export function updateMemberHeYue(data) {
  return request({
    url: '/member/updateMemberHeYue',
    method: 'post',
    data
  })
}

export function updateMemberFengkong(data) {
  return request({
    url: '/member/updateMemberFengkong',
    method: 'post',
    data
  })
}

export function updateHeYueStatus(data) {
  return request({
    url: '/member/updateHeYueApplyState',
    method: 'post',
    data
  })
}

export function updateAdminStatus(data) {
  return request({
    url: '/member/updateMemberState',
    method: 'post',
    data
  })
}

export function giveMoney(data) {
  return request({
    url: '/member/giveMoney',
    method: 'post',
    data
  })
}
