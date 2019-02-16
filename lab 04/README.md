# 4. Pods and YAML (and JSON) (and Logs)

In a real life situation, you will not be creating all those Kubernetes objects from the kubectl command line:
- the kubectl command line does not support all options
- the kubectl commands are difficult to maintain in a version control system

However, what is therefore a better option is to describe your Kubernetes resources/object in a YAML (or JSON, for that matter) manifest file. 

Now, let's first look up the YAML manifest for one of the existing Pods:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 04$ kubectl get pod terra10-gx6sr -o yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: 2018-09-17T19:10:01Z
  generateName: terra10-
  labels:
    run: terra10
  name: terra10-gx6sr
  namespace: default
  ownerReferences:
  - apiVersion: v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicationController
    name: terra10
    uid: 46ae2724-baad-11e8-b22d-0800276251a2
  resourceVersion: "12700"
  selfLink: /api/v1/namespaces/default/pods/terra10-gx6sr
  uid: 46afd495-baad-11e8-b22d-0800276251a2
spec:
  containers:
  - image: lgorissen/terra10
    imagePullPolicy: Always
    name: terra10
    ports:
    - containerPort: 8080
      protocol: TCP
    resources: {}
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: default-token-2jbqj
      readOnly: true
  dnsPolicy: ClusterFirst
  nodeName: minikube
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: default
  serviceAccountName: default
  terminationGracePeriodSeconds: 30
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300
  volumes:
  - name: default-token-2jbqj
    secret:
      defaultMode: 420
      secretName: default-token-2jbqj
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: 2018-09-17T19:10:01Z
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: 2018-09-17T19:10:05Z
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: 2018-09-17T19:10:01Z
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: docker://eb9f6ccdbc7ad72ca97a52cc320902ac06400a92d7958f38b979ce78cf9bc07b
    image: lgorissen/terra10:latest
    imageID: docker-pullable://lgorissen/terra10@sha256:5b3f0afec5aac18c25749370f4ced0133b43041390cf0891a308d2261df97e7b
    lastState: {}
    name: terra10
    ready: true
    restartCount: 0
    state:
      running:
        startedAt: 2018-09-17T19:10:04Z
  hostIP: 10.0.2.15
  phase: Running
  podIP: 172.17.0.4
  qosClass: BestEffort
  startTime: 2018-09-17T19:10:01Z
developer@developer-VirtualBox:~/projects/k4d/lab 04$ 
```
Ha, you must feel a little intimidated by now :-S

But, it is quite easy to break down this whole YAML manifest into pieces:

| piece      | value              | description |
|------------|--------------------|------|
| apiVersion | v1                 | Kubernetes API version for this manifest file   |
| kind       | Pod                | Kubernetes resource/object type   |
| metadata   | yaml sub structure | Pod metadata like name and labels |
| spec       | yaml sub structure | Pod specification of the Pod's contents |
| status     | yaml sub structure | Pod's runtime status |

Of course, when creating a Pod it is not necessary to submit such a long manifest file. Obviously, the status part is not required, as well as a lot of other options/pieces.

Let's have a look at a YAML manifest file named `terra10-simple.yaml` that we will use to create a Pod (you will also find that in the `lab 04` directory) (here: with comments):
```
apiVersion: v1                    # Kubernetes API version for this Pod manifest file
kind: Pod                         # File describes a Pod
metadata:
  name: terra10-simple            # Name of the Pod
 spec:
  containers:                     # Specification of containers starts here
  - image: lgorissen/terra10      # Container image name
    name: terra10                 # Container name
    ports:
    - containerPort: 8080         # Port the app is listening on
      protocol: TCP
```

With such a YAML manifest file, it is really easy to create the Kubernetes resources/objects. The command for running a YAML manifest file is allways of format `kubectl create -f <yaml_file_name>`. 

In our case:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 04$ kubectl create -f terra10-simple.yaml 
pod/terra10-simple created
developer@developer-VirtualBox:~/projects/k4d/lab 04$ kubectl get pod
NAME             READY     STATUS    RESTARTS   AGE
terra10-gx6sr    1/1       Running   0          48m
terra10-qjdqv    1/1       Running   0          47m
terra10-simple   1/1       Running   0          4s
terra10-z4lkv    1/1       Running   0          47m
developer@developer-VirtualBox:~/projects/k4d/lab 04$
```
The `kubectl get pod` command shows that a new Pod has been created: *terra10-simple*.

You can also query for a manifest in JSON format:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 04$ kubectl get pod terra10-simple -o json
{
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
        "creationTimestamp": "2018-09-17T19:58:37Z",
        "name": "terra10-simple",
        "namespace": "default",
...
        ],
        "hostIP": "10.0.2.15",
        "phase": "Running",
        "podIP": "172.17.0.7",
        "qosClass": "BestEffort",
        "startTime": "2018-09-17T19:58:37Z"
    }
}
developer@developer-VirtualBox:~/projects/k4d/lab 04$
```

The last part of the JSON shows that the Pod IP addres is 172.17.0.7. Let's use that to directly access the Pod:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 04$ curl 172.17.0.7:8080
Hello, you landed on Terra10 and host terra10-simple welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 04$ 
```

# Logs
Important, yet so simple ... get your container's log file:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 04$ kubectl logs terra10-simple 
Terra10 HelloWorld Server is starting...
Terra10 HelloWorld Server started
developer@developer-VirtualBox:~/projects/k4d/lab 04$
```
