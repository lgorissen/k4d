# 10. ReplicaSets

ReplicationControllers are deprecated. It is good to know them, as you will encounter them in 'older' Kubernetes systems. However, whenever you have the choice, you should use ReplicaSets or Deployments.

**ReplicaSets vs Replication Controllers**

ReplicaSets and Replication Controllers are different in 2 areas:

1. **Label selectors:** the Kubernetes documentation learns us that 'ReplicaSet supports the new set-based selector requirements as described in the labels user guide whereas a Replication Controller only supports equality-based selector requirements'
2. **Deployments:** the Replication Controller supports the kubectl 'rolling-update' command for updating to new Pod version. In case of the ReplicaSet however, updates are done using the combination of the Kubernetes Deployment and the ReplicaSet 

For deployment and updates, there will be separate labs. In this lab, we'll focus on the ReplicaSet. There, you will also learn that ' Deployments are the way to go'!


**ReplicaSets and set-based Label Selectors**

The Replication Controller supports Label Selectors with requirements of the type 'equality-based'. With these 'equality-based' requirements, matching is done based on Label keys and values, and matching objects must satify ALL of the specified Label constraints. Three operators are supported: '=', '==' and '!='. Ahum, well ... that's only 2 different operators!

The ReplicaSet on the other hand supports Label Selectors with requirements of the type 'set-based'. With these 'set-based' requirements, matching is done by 'filtering keys according to a set of values'. Three operators are supported: 'in', 'notin' and 'exists'. For example:

| selector                        | selects resources with |
|---------------------------------|--------------------------|
| environment in (production, qa) | **key** 'environment' and **value** 'production' or 'qa' |
| tier notin (frontend, backend)   | **key** 'tier' and **value** not 'frontend' and not 'backend' | 
| partition                       | **key** 'partition' is present   |
| !partition                      | **key** 'partition' is not present| 

The ***set-based*** requirements can be mixed with ***equality-based*** requirements.

## 10.1 ReplicaSet example

A ReplicaSet manifest file example:

```bash
apiVersion: apps/v1beta2   # ReplicaSet is part of a newer API version
kind: ReplicaSet           # type ReplicaSet
metadata:
  name: terra10-rs
spec:
  replicas: 3              # number of Pods
  selector:                # label selector - set-based
    matchExpressions:      # def of a Label Selector requirement
      - key: app           # key 'app' is in set of values (terra10)
        operator: In
        values:
         - terra10
  template:                # start of Pod template
    metadata:
      labels:
        app: terra10
    spec:
      containers:
      - name: terra10
        image: lgorissen/terra10
```

Running the manifest file:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl create -f terra10-replicaset.yaml 
replicaset.apps/terra10-rs created
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rs-g65nx   1/1       Running   0          9s
terra10-rs-k7vbz   1/1       Running   0          9s
terra10-rs-t9rjr   1/1       Running   0          9s
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

The ReplicaSet created 3 Pods - just as expected.
Now, let's delete the ReplicaSet without deleting the Pods:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl delete rs terra10-rs --cascade=false
replicaset.extensions "terra10-rs" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rs-g65nx   1/1       Running   0          3m
terra10-rs-k7vbz   1/1       Running   0          3m
terra10-rs-t9rjr   1/1       Running   0          3m
developer@developer-VirtualBox:~/projects/k4d/lab 10$
```

You now can delete the Pods manually:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl delete pod -l app=terra10
pod "terra10-rs-g65nx" deleted
pod "terra10-rs-k7vbz" deleted
pod "terra10-rs-t9rjr" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```
and you will see that the ReplicaSet creates new Pods:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get pod
NAME               READY   STATUS    RESTARTS   AGE
terra10-rs-bzqmf   1/1     Running   0          93s
terra10-rs-n6wqd   1/1     Running   0          93s
terra10-rs-tpxqv   1/1     Running   0          93s
developer@developer-VirtualBox:~/projects/k4d/lab 10$
```

## 10.2 Scaling up and down

Scaling a ReplicaSet is similar to a Replication Controller:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get rs
NAME         DESIRED   CURRENT   READY   AGE
terra10-rs   3         3         3       5m58s
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl scale rs terra10-rs --replicas=5
replicaset.extensions/terra10-rs scaled
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get pod
NAME               READY   STATUS              RESTARTS   AGE
terra10-rs-bdbf4   0/1     ContainerCreating   0          4s
terra10-rs-bzqmf   1/1     Running             0          5m25s
terra10-rs-jhpx5   0/1     ContainerCreating   0          4s
terra10-rs-n6wqd   1/1     Running             0          5m25s
terra10-rs-tpxqv   1/1     Running             0          5m25s
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

Now, scale down to 2 replicas:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl scale rs terra10-rs --replicas=2
replicaset.extensions/terra10-rs scaled
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl get pod
NAME               READY   STATUS        RESTARTS   AGE
terra10-rs-bdbf4   1/1     Terminating   0          85s
terra10-rs-bzqmf   1/1     Running       0          6m46s
terra10-rs-jhpx5   1/1     Terminating   0          85s
terra10-rs-n6wqd   1/1     Running       0          6m46s
terra10-rs-tpxqv   1/1     Terminating   0          6m46s
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

... and clean up the Replication Controller

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ kubectl delete rs terra10-rs
replicaset.extensions "terra10-rs" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

Remember to drink coffee...
