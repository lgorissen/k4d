# 36. kubectl: as a time saver

The previous labs have all taken the approach to first write manifest files and then create the objects using the `kubectl create -f <manifest-file>` command. With the growing trend of treating everything - including infrastructure - as code, that seems to be the right approach.

However, a good understanding of the `kubectl` commands can be a great time saver during development.

So, this lab will show the `kubectl` commands that could have been used in the previous labs.

As usual, files can be found in the `Lab 36` directory. The Container definitions are not given: the Containers are available in Docker Hub, and should you need the Container definition, you can look them up in the other labs.

## Create a Pod

Create a Pod:

- `kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run-pod/v1` # deprecated
- `kubectl run terra10 --image=lgorissen/terra10 --port=8080 --restart=Never`  # recommended

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run-pod/v1
pod/terra10 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl delete pod terra10
pod "terra10" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10 --image=lgorissen/terra10 --port=8080 --restart=Never
pod/terra10 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Monitor

For monitoring resource usage:

- `kubectl top node` # for node statistics
- `kubectl top pod` # for Pod statistics

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl top node minikube
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
minikube   269m         6%     3629Mi          46%
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl top pod terra10
NAME      CPU(cores)   MEMORY(bytes)
terra10   0m           8Mi
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Create by file

The already well known way to create a Kubernetes object using a manifest file:

- `kubectl create -f <file_name>`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create -f terra10-simple.yaml
pod/terra10-simple created
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Get log files from Pod

Get log file of main container of Pod:

- `kubectl logs <pod>`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME      READY   STATUS    RESTARTS   AGE
terra10   1/1     Running   0          9m28s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl logs terra10
Terra10 HelloWorld Server is starting...
Terra10 HelloWorld Server started
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Get log file of previous instance of Container in a Pod - if exists:

- `kubectl pod <pod> -container <container> -previous`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl logs terra10 -c terra10 --previous
Error from server (BadRequest): previous terminated container "terra10" in pod "terra10" not found
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Create a Pod with Labels

Upon Pod create, the `kubectl run` command supports lots of parameters. For example, for the creation of Labels:

- `kubectl run terra10 --image=lgorissen/terra10 --port=8080 --restart=Never --labels="microservice=playback,rel=18.1.3"`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10 --image=lgorissen/terra10 --port=8080 --restart=Never --labels="microservice=playback,rel=18.1.3"
pod/terra10 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod --show-labels
NAME      READY   STATUS              RESTARTS   AGE   LABELS
terra10   0/1     ContainerCreating   0          6s    microservice=playback,rel=18.1.3
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Set a kubectl context

Change the `kubectl` config to use a specific context.

- `kubectl config current-context` # get current context
- `kubectl config set-context kubernetes-admin@kubernetes --namespace=kube-system` # change the namespace for a context
- `kubectl config use-context kubernetes-admin@kubernetes` # use another context

```bash
developer@developer-VirtualBox:~$ kubectl config current-context
kubernetes-admin@kubernetes
developer@developer-VirtualBox:~$ kubectl config set-context kubernetes-admin@kubernetes --namespace=kube-system
Context "kubernetes-admin@kubernetes" modified.
developer@developer-VirtualBox:~$ kubectl get pod
NAME                                       READY   STATUS    RESTARTS   AGE
coredns-86c58d9df4-fprc7                   1/1     Running   21         14d
coredns-86c58d9df4-s4wxw                   1/1     Running   21         14d
default-http-backend-5ff9d456ff-nftdb      1/1     Running   17         12d
etcd-minikube                              1/1     Running   54         14d
kube-addon-manager-minikube                1/1     Running   54         14d
kube-apiserver-minikube                    1/1     Running   54         14d
kube-controller-manager-minikube           1/1     Running   28         14d
kube-proxy-s9ms7                           1/1     Running   21         14d
kube-scheduler-minikube                    1/1     Running   56         14d
kubernetes-dashboard-ccc79bfc9-2x4pp       1/1     Running   42         14d
metrics-server-6fc4b7bcff-zcgfs            1/1     Running   35         14d
nginx-ingress-controller-7c66d668b-vvsxz   1/1     Running   27         12d
storage-provisioner                        1/1     Running   42         14d
developer@developer-VirtualBox:~$
```

## Replace a Pod resource

Replace a Pod's definition with another.

- `kubectl replace --force -f ./terra10-simple-replacement.yaml`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create -f terra10-simple.yaml
pod/terra10-simple created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME             READY   STATUS    RESTARTS   AGE
terra10-simple   1/1     Running   0          9m47s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl replace --force -f ./terra10-simple-replacement.yaml
pod "terra10-simple" deleted
pod/terra10-simple replaced
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME             READY   STATUS    RESTARTS   AGE
terra10-simple   1/1     Running   0          9s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Create, scale and delete a ReplicationController

Create a ReplicationController:

- `kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run/v1` # deprecated

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run/v1
kubectl run --generator=run/v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
replicationcontroller/terra10 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get replicationcontroller
NAME      DESIRED   CURRENT   READY   AGE
terra10   1         1         1       17s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME            READY   STATUS    RESTARTS   AGE
terra10-6mzs5   1/1     Running   0          26s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Scale a ReplicationController

- `kubectl scale rc terra10 --replicas=3`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl scale rc terra10 --replicas=3
replicationcontroller/terra10 scaled
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME            READY   STATUS              RESTARTS   AGE
terra10-2jz2j   0/1     ContainerCreating   0          4s
terra10-6mzs5   1/1     Running             0          70s
terra10-k5ls8   0/1     ContainerCreating   0          4s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Delete ReplicationController - but not the Pods

- `kubectl delete rc terra10 --cascade=false`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl delete rc terra10 --cascade=false
replicationcontroller "terra10" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME            READY   STATUS    RESTARTS   AGE
terra10-2jz2j   1/1     Running   0          64s
terra10-6mzs5   1/1     Running   0          2m10s
terra10-k5ls8   1/1     Running   0          64s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Create, scale and delete a ReplicationSet

Well .. there does not seem to be a way to start a ReplicationSet from `kubectl` command line. Intention is probably that ReplicationSets are to be started using a Deployment - which makes sense.

Nevertheless, for the exercise we will start a ReplicationSet using a manifest file:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create -f terra10-replicationset.yaml
replicaset.apps/terra10-rs created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME               READY   STATUS    RESTARTS   AGE
terra10-rs-95hvr   1/1     Running   0          76s
terra10-rs-pqvc2   1/1     Running   0          76s
terra10-rs-zllnk   1/1     Running   0          76s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Scale a ReplicationSet

- `kubectl scale rs terra10-rs --replicas=5`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl scale rs terra10-rs --replicas=5
replicaset.extensions/terra10-rs scaled
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME               READY   STATUS              RESTARTS   AGE
terra10-rs-95hvr   1/1     Running             0          2m29s
terra10-rs-pqvc2   1/1     Running             0          2m29s
terra10-rs-wkvz7   0/1     ContainerCreating   0          4s
terra10-rs-zllnk   1/1     Running             0          2m29s
terra10-rs-zr9l8   0/1     ContainerCreating   0          4s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Delete the ReplicationSet

- `kubectl delete rs terra-rs`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl delete rs terra10-rs
replicaset.extensions "terra10-rs" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Run a Job

Run a Job:

- `kubectl run terra10-job --image=lgorissen/terra10-job --restart=OnFailure` # deprecated
- `kubectl create job terra10-batch-job --image=lgorissen/terra10-job` # recommended

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10-job --image=lgorissen/terra10-job --restart=OnFailure
kubectl run --generator=job/v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
job.batch/terra10-job created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create job terra10-batch-job --image=lgorissen/terra10-job
job.batch/terra10-batch-job created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get job
NAME                COMPLETIONS   DURATION   AGE
terra10-batch-job   0/1           18s        18s
terra10-job         0/1           72s        72s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Use the `kubectl logs <pod>` command to have a look at the Job execution.

## Run a CronJob

Run a CronJob that runs every 10 minutes:

- `kubectl run terra10-cronjob-10min --schedule="0,10,20,30,40,50 * * * *" --image=lgorissen/terra10-job --restart=OnFailure`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10-cronjob-10min --schedule="0,10,20,30,40,50 * * * *" --image=lgorissen/terra10-job --restart=OnFailure
kubectl run --generator=cronjob/v1beta1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
cronjob.batch/terra10-cronjob-10min created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get cronjobs.batch
NAME                    SCHEDULE                   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
terra10-cronjob-10min   0,10,20,30,40,50 * * * *   False     0        <none>          9s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Inspect the Job's results with `kubectl logs <pod>`.

## Create and scale a Deployment

Create and scale a Deployment:

- `kubectl run terra10 --image=lgorissen/terra10 --port=8080  --replicas=5`
- `kubectl scale deployment terra10 --replicas=2`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10 --image=lgorissen/terra10 --port=8080  --replicas=5
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/terra10 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get deployments
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
terra10   0/5     5            0           6s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get rs
NAME                 DESIRED   CURRENT   READY   AGE
terra10-7d89d76b64   5         5         0       9s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME                                     READY   STATUS              RESTARTS   AGE
terra10-7d89d76b64-2z9mp                 0/1     ContainerCreating   0          13s
terra10-7d89d76b64-4vg7n                 0/1     ContainerCreating   0          13s
terra10-7d89d76b64-fpcbv                 0/1     ContainerCreating   0          13s
terra10-7d89d76b64-r6pf9                 0/1     ContainerCreating   0          13s
terra10-7d89d76b64-tlw59                 0/1     ContainerCreating   0          13s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Now scale down:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl scale deployment terra10 --replicas=2
deployment.extensions/terra10 scaled
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## Expose a Deployment

A Deployment must be exposed so it can be accessed:

- `kubectl expose deployment terra10 --port=8090 --target-port=8080` # ClusterIP:
- `kubectl expose deployment terra10 --port=8091 --target-port=8080 --type='LoadBalancer' --name=terra10-lb` # LoadBalancer
- `kubectl expose deployment terra10 --port=8092 --target-port=8080 --type='NodePort' --name=terra10-np` # NodePort

The ClusterIP Service:

```bash
developer@developer-VirtualBox:~$ kubectl expose deployment terra10 --port=8090 --target-port=8080
service/terra10 exposed
developer@developer-VirtualBox:~$ kubectl get service terra10
NAME      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
terra10   ClusterIP   10.102.213.120   <none>        8090/TCP   13s
developer@developer-VirtualBox:~$ curl 10.102.213.120:8090
Hello, you landed on Terra10 and host terra10-7d89d76b64-tlw59 welcomes you!
developer@developer-VirtualBox:~$
```

The LoadBalancer Service:

```bash
developer@developer-VirtualBox:~$ kubectl expose deployment terra10 --port=8090 --target-port=8080 --type='LoadBalancer' --name=terra10-lb
service/terra10-lb exposed
developer@developer-VirtualBox:~$ kubectl get service terra10-lb
NAME         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
terra10-lb   LoadBalancer   10.103.142.217   <pending>     8090:31959/TCP   18s
developer@developer-VirtualBox:~$ curl 10.103.142.217:8090
Hello, you landed on Terra10 and host terra10-7d89d76b64-fpcbv welcomes you!
developer@developer-VirtualBox:~$
```

The NodePort Service:

```bash
developer@developer-VirtualBox:~$ kubectl expose deployment terra10 --port=8092 --target-port=8080 --type='NodePort' --name=terra10-np
service/terra10-np exposed
developer@developer-VirtualBox:~$ kubectl get service terra10-np
NAME         TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
terra10-np   NodePort   10.110.60.210   <none>        8092:32285/TCP   16s
developer@developer-VirtualBox:~$ curl 10.0.2.15:32285
Hello, you landed on Terra10 and host terra10-7d89d76b64-fpcbv welcomes you!
developer@developer-VirtualBox:~$
```

## Services

Services can be created using `kubectl`. However, note that this may require manual changes to the Selector that the Service uses to access the Pods. It would be nice if the Services Selector could be set upon creation, but that does not seem to be possible.

- `kubectl create service clusterip terra10-cip --tcp=8090:8080` # ClusterIP
- `kubectl create service loadbalancer terra10-clb --tcp=8091:8080` # Loadbalancer
- `kubectl create service nodeport terra10-np --tcp=8092:8080` # Nodeport

```bash
developer@developer-VirtualBox:~$ kubectl create service clusterip terra10-cip --tcp=8090:8080
service/terra10-cip created
developer@developer-VirtualBox:~$ kubectl create service loadbalancer terra10-clb --tcp=8091:8080
service/terra10-clb created
developer@developer-VirtualBox:~$ kubectl create service nodeport terra10-clb --tcp=8092:8080
Error from server (AlreadyExists): services "terra10-clb" already exists
developer@developer-VirtualBox:~$ kubectl create service loadbalancer terra10-clb --tcp=8091:8080^C
developer@developer-VirtualBox:~$ kubectl create service nodeport terra10-np --tcp=8092:8080
service/terra10-np created
developer@developer-VirtualBox:~$ kubectl get services
NAME          TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
kubernetes    ClusterIP      10.96.0.1        <none>        443/TCP          14d
terra10-cip   ClusterIP      10.100.108.242   <none>        8090/TCP         61s
terra10-clb   LoadBalancer   10.97.108.39     <pending>     8091:30489/TCP   47s
terra10-np    NodePort       10.97.241.154    <none>        8092:30049/TCP   6s
developer@developer-VirtualBox:~$
```

Would you be so kind as to find out yourself how the Selector can/needs to be changed to map the service to some existing Pods?

## Expose a ReplicationController

The `kubectl expose`  command can expose various components: Deployments, Pods, ReplicaSets, ReplicationControllers and Services.

For exposing a ReplicationController:

- `kubectl expose rc terra10 --type=LoadBalancer --name terra10-http`

Create the ReplicationController and then expose it:

```bash
developer@developer-VirtualBox:~$ kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run/v1
kubectl run --generator=run/v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
replicationcontroller/terra10 created
developer@developer-VirtualBox:~$ kubectl expose rc terra10 --type=LoadBalancer --name terra10-http
service/terra10-http exposed
developer@developer-VirtualBox:~$ kubectl get service terra10-http
NAME           TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
terra10-http   LoadBalancer   10.100.247.60   <pending>     8080:30874/TCP   13s
developer@developer-VirtualBox:~$ curl 10.100.247.60:8080
Hello, you landed on Terra10 and host terra10-2pdq4 welcomes you!
developer@developer-VirtualBox:~$
```

## ConfigMaps

ConfigMap - Literal

- `kubectl create configmap myconfigmap1 --from-literal=transporter-delay=45`

ConfigMap - From file

- `kubectl create configmap myconfigmap2 --from-file=transporter-delay=transporter.conf`

ConfigMap - From configuration file

- `kubectl create configmap myconfigmap3 --from-file=transporter.json`

ConfigMap - From configuration directory

- `kubectl create configmap myconfigmap4 --from-file=config/`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create configmap myconfigmap1 --from-literal=transporter-delay=45
configmap/myconfigmap1 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create configmap myconfigmap2 --from-file=transporter-delay=transporter.conf
configmap/myconfigmap2 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create configmap myconfigmap3 --from-file=transporter.json
configmap/myconfigmap3 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create configmap myconfigmap4 --from-file=config/
configmap/myconfigmap4 created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get configmap
NAME           DATA   AGE
myconfigmap1   1      2m26s
myconfigmap2   1      84s
myconfigmap3   1      2s
myconfigmap4   2      44s
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Inspect the ConfigMaps with `kubectl describe`:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl describe configmaps myconfigmap1
Name:         myconfigmap1
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
transporter-delay:
----
45
Events:  <none>
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Etc...

## Secret

Create a Secret from file:

- `kubectl create secret generic terra10-from-file --from-file=terra10-user --from-file=terra10-password`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ echo -n 'terra10-admin' > terra10-user
developer@developer-VirtualBox:~/projects/k4d/lab 36$ echo -n 'welcome01' > terra10-password
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create secret generic terra10-from-file --from-file=terra10-user --from-file=terra10-password
secret/terra10-from-file created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl describe secret terra10-from-file
Name:         terra10-from-file
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
terra10-password:  9 bytes
terra10-user:      13 bytes
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

Create a Secret literal:

- `kubectl create secret generic terra10-literal --from-literal=terra10-user=terra10-admin --from-literal=terra10-password=welcome01`

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl create secret generic terra10-literal --from-literal=terra10-user=terra10-admin --from-literal=terra10-password=welcome01
secret/terra10-literal created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl describe secret terra10-literal
Name:         terra10-literal
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
terra10-password:  9 bytes
terra10-user:      13 bytes
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## ReplicationController update and rollback

ReplicationController update: from ReplicationController `terra10-rc` to `terra10-rc2` with image `lgorissen/terra10:r2` and then a rollback:

- `kubectl rolling-update terra10-rc terra10-rc-r2 --image=lgorissen/terra10:r2`
- `kubectl rolling-update terra10-rc terra10-rc-r2 --rollback`

Create the ReplicationController and update it:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl run terra10-rc --image=lgorissen/terra10 --port=8080 --generator=run/v1 --replicas=5
kubectl run --generator=run/v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
replicationcontroller/terra10-rc created
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl get pod
NAME               READY   STATUS    RESTARTS   AGE
terra10-rc-8dn6x   1/1     Running   0          2m22s
terra10-rc-b8m55   1/1     Running   0          2m22s
terra10-rc-c9n96   1/1     Running   0          2m22s
terra10-rc-gtsbp   1/1     Running   0          2m22s
terra10-rc-r5nkw   1/1     Running   0          2m22s
developer@developer-VirtualBox:~/projects/k4d/lab 36$ kubectl rolling-update terra10-rc terra10-rc-r2 --image=lgorissen/terra10:r2
Command "rolling-update" is deprecated, use "rollout" instead
Created terra10-rc-r2
Scaling up terra10-rc-r2 from 0 to 5, scaling down terra10-rc from 5 to 0 (keep 5 pods available, don't exceed 6 pods)
Scaling terra10-rc-r2 up to 1
Scaling terra10-rc down to 4
Scaling terra10-rc-r2 up to 2
Scaling terra10-rc down to 3
Scaling terra10-rc-r2 up to 3
Scaling terra10-rc down to 2
Scaling terra10-rc-r2 up to 4
Scaling terra10-rc down to 1
Scaling terra10-rc-r2 up to 5
Scaling terra10-rc down to 0
Update succeeded. Deleting terra10-rc
replicationcontroller/terra10-rc-r2 rolling updated to "terra10-rc-r2"
developer@developer-VirtualBox:~/projects/k4d/lab 36$
```

## ReplicationSet update

Is not possible via `kubectl`: you should use a Deployment!

## Create a Deployment

Various ways to start a Deployment with 1 replica:

- `kubectl run terra10-0 --image=lgorissen/terra10 --port=8080`
- `kubectl run terra10-1 --image=lgorissen/terra10 --port=8081 --generator=deployment/v1beta1`
- `kubectl run terra10-2 --image=lgorissen/terra10 --port=8082 --restart=Always`

And a Deployment with 5 replicas:

- `kubectl run terra10-3 --image=lgorissen/terra10 --port=8083  --replicas=5`

```bash
developer@developer-VirtualBox:~$ kubectl run terra10-0 --image=lgorissen/terra10 --port=8080
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/terra10-0 created
developer@developer-VirtualBox:~$ kubectl run terra10-1 --image=lgorissen/terra10 --port=8081 --generator=deployment/v1beta1
kubectl run --generator=deployment/v1beta1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.extensions/terra10-1 created
developer@developer-VirtualBox:~$ kubectl run terra10-2 --image=lgorissen/terra10 --port=8082 --restart=Always
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/terra10-2 created
developer@developer-VirtualBox:~$ kubectl run terra10-3 --image=lgorissen/terra10 --port=8083  --replicas=5
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/terra10-3 created
developer@developer-VirtualBox:~$ kubectl get deployment
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
terra10-0   1/1     1            1           75s
terra10-1   1/1     1            1           55s
terra10-2   1/1     1            1           41s
terra10-3   1/5     5            1           26s
developer@developer-VirtualBox:~$
```

## Update a Deployment to a new image

Updating a deployment in the following steps:

- create deployment

  - `kubectl run terra10 --image=lgorissen/terra10 --port=8080  --replicas=5`

- set a new image to trigger the deployment rollout

  - `kubectl set image deployment terra10 terra10=lgorissen/terra10:r2`

- check status

  - `kubectl rollout status deployment/terra10`

- check rollout history

  - `kubectl rollout history deployment terra10`

- undo deployment

  - `kubectl rollout undo deployment terra10 --to-revision=1`

```bash
developer@developer-VirtualBox:~$ kubectl run terra10 --image=lgorissen/terra10 --port=8080  --replicas=5
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/terra10 created
developer@developer-VirtualBox:~$ kubectl get pod
NAME                       READY   STATUS    RESTARTS   AGE
terra10-7d89d76b64-2kw75   1/1     Running   0          2m27s
terra10-7d89d76b64-fgfbf   1/1     Running   0          2m27s
terra10-7d89d76b64-k2kt8   1/1     Running   0          2m27s
terra10-7d89d76b64-k7dkp   1/1     Running   0          2m27s
terra10-7d89d76b64-pr9cv   1/1     Running   0          2m27s
developer@developer-VirtualBox:~$ kubectl set image deployment terra10 terra10=lgorissen/terra10:r2
deployment.extensions/terra10 image updated
developer@developer-VirtualBox:~$ kubectl get pod
NAME                       READY   STATUS              RESTARTS   AGE
terra10-67c7644f4d-7vrlg   0/1     ContainerCreating   0          7s
terra10-67c7644f4d-9sgk9   0/1     ContainerCreating   0          7s
terra10-67c7644f4d-ndkqp   0/1     ContainerCreating   0          7s
terra10-7d89d76b64-2kw75   1/1     Running             0          2m46s
terra10-7d89d76b64-fgfbf   1/1     Running             0          2m46s
terra10-7d89d76b64-k2kt8   1/1     Terminating         0          2m46s
terra10-7d89d76b64-k7dkp   1/1     Running             0          2m46s
terra10-7d89d76b64-pr9cv   1/1     Running             0          2m46s
developer@developer-VirtualBox:~$ kubectl rollout status deployment/terra10
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 3 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 4 of 5 updated replicas are available...
deployment "terra10" successfully rolled out
developer@developer-VirtualBox:~$ kubectl rollout history deployment terra10
deployment.extensions/terra10
REVISION  CHANGE-CAUSE
1         <none>
2         <none>

developer@developer-VirtualBox:~$ kubectl rollout undo deployment terra10 --to-revision=1
deployment.extensions/terra10 rolled back
developer@developer-VirtualBox:~$ kubectl rollout status deployment/terra10
Waiting for deployment "terra10" rollout to finish: 3 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 3 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 3 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 3 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "terra10" rollout to finish: 4 of 5 updated replicas are available...
deployment "terra10" successfully rolled out
developer@developer-VirtualBox:~$
```

## Update a po, rc, deploy, ds, rs to a new image

The `kubectl set image` command can also be used for:

- pod
- replicationcontroller
- deployment
- daemonset
- replicaset

The syntax is:

- `kubectl set image <object_type> <object_name> <container_name>=<image_name>`

We're done.

Clean up your machine, have a beer!