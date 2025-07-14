const getWorker = (workers) => {
  return new Promise((resolve, reject) => {
    const workersLoad = workers.map((worker) =>
      worker.getResourceUsage().then((stats) => {
        // calculate CPU usage
        return stats.ru_utime + stats.ru_stime;
      })
    );

    // wait for all worker load calculations
    Promise.all(workersLoad)
      .then((workersLoadCalc) => {
        // find the index of the worker with the least load
        let leastLoadedWorker = 0;
        let leastWorkerLoad = workersLoadCalc[0] || Infinity; // initialize with first load or Infinity

        workersLoadCalc.forEach((load, index) => {
          if (load < leastWorkerLoad) {
            leastLoadedWorker = index;
            leastWorkerLoad = load;
          }
        });

        // resolve with the least loaded worker
        resolve(workers[leastLoadedWorker]);
      })
      .catch(reject); // forward any errors
  });
};

export default getWorker;
