export default function clientMiddleware(client) {
  return ({dispatch, getState}) => {
    return next => action => {
      //如果是action创建者,则直接返回action
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      //如果promise不存在action中,则跳过直接连到下个中间件
      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
      if (!promise) {
        return next(action);
      }
      //发出请求
      const [REQUEST, SUCCESS, FAILURE] = types;
      next({...rest, type: REQUEST});
      //promise是个参数为client,执行相应的http请求的函数
      const actionPromise = promise(client);
      //返回成功或者失败的action
      actionPromise.then(
        (result) => next({...rest, result, type: SUCCESS}),
        (error) => next({...rest, error, type: FAILURE})
      ).catch((error)=> {
        console.error('MIDDLEWARE ERROR:', error);
        next({...rest, error, type: FAILURE});
      });

      return actionPromise;
    };
  };
}
