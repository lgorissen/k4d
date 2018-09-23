# 10. Replication Sets

ReplicationControllers are deprecated. It is good to know them, as you will encounter them in 'older' Kubernetes systems. However, whenever you have the choice, you should use Replication Sets.

**Replication Sets vs Replication Controllers**

Replication Sets and Replication Controllers are different in 2 areas:

1. **Label selectors:** the Kubernetes documentation learns us that 'ReplicaSet supports the new set-based selector requirements as described in the labels user guide whereas a Replication Controller only supports equality-based selector requirements'
2. **Deployments:** the Replication Controller supports the kubectl 'rolling-update' command for updating to new Pod version. In case of the Replication Set however, updates are done using the combination of the Kubernetes Deployment and the Replication Set 

For deployment and updates, there will be separate labs. In this lab, we'll focus on the Replication Set. There, you will also learn that ' Deployments are the way to go'!


**Replication Sets and set-based Label Selectors**

The Replication Controller supports Label Selectors with requirements of the type 'equality-based'. With these 'equality-based' requirements, matching is done based on Label keys and values, and matching objects must satify ALL of the specified Label constraints. Three operators are supported: '=', '==' and '!='. Ahum, well ... that's only 2 different operators!

The Replication Set on the other hand supports Label Selectors withr requirements of the type 'set-based'. With these 'set-based' requirements, matching is done by 'filtering keys according to a set of values'. Three operators is supported: 'in', 'notin' and 'exists'. For example:

| selector                        | selects resources with |
|---------------------------------|--------------------------|
| environment in (production, qa) | **key** 'environment' and **value** 'production' or 'qa' |
| tier notin (frontend, backend   | **key** 'tier' and **value** not 'frontend' and not 'backend' | 
| partition                       | **key** 'partition' is present   |
| !partition                      | **key** 'partition' is not present| 

The ***set-based*** requirements can be mixed with ***equality-based*** requirements.

## 10.1 Replication Set example

A Replication Set manifest file example:

```bash
apiVersion: apps/v1beta2   # Replication Set is part of a newer API version
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
developer@developer-VirtualBox:~/projects/k4d/lab 10$ k create -f terra10-replicationset.yaml 
replicaset.apps/terra10-rs created
developer@developer-VirtualBox:~/projects/k4d/lab 10$ k get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rs-g65nx   1/1       Running   0          9s
terra10-rs-k7vbz   1/1       Running   0          9s
terra10-rs-t9rjr   1/1       Running   0          9s
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

The Replication Set created 3 Pods - just as expected.
Now, let's delete the Replication Set without deleting the Pods:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ k delete rs terra10-rs --cascade=false
replicaset.extensions "terra10-rs" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 10$ k get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rs-g65nx   1/1       Running   0          3m
terra10-rs-k7vbz   1/1       Running   0          3m
terra10-rs-t9rjr   1/1       Running   0          3m
developer@developer-VirtualBox:~/projects/k4d/lab 10$
```

You now can delete the Pods manually:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 10$ k delete pod -l app=terra10
pod "terra10-rs-g65nx" deleted
pod "terra10-rs-k7vbz" deleted
pod "terra10-rs-t9rjr" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 10$ 
```

Remember to drink coffee...
