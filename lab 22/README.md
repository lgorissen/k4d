# 22. Volume configMap advanced: handling config files and directories

The previous, first lab on ConfigMaps has shown how simple configuration items can be mapped on operations and arguments. However. ConfigMap has more to offer! It can create its key-value pairs in the following ways:

**Literal**

A configMap with/from a literal entry:

![literal](img/lab22-configMap-literal.png)


**From file**

A configMap with an entry from a file:

![from file](img/lab22-configMap-from-file.png)

**From configuration file**

A configMap with a complete configuration file entry:

![from configuration file](img/lab22-configMap-from-configuration-file.png)


**From configuration directory**

A configMap that takes entries from the files in a directory:

![from configuration directory](img/lab22-configMap-from-configuration-directory.png)


The configuration options that are shown above illustrate that the configMap mechanism is very flexible: it will most likely also cover your applications configuration requirements.

## 22.1 Mount configMap into a Pod

The only part that is missing in your toolkit at this point is 'how to mount *only* the right file of the configMap in the right directory/file'.

The image below shows what we want to achieve:

![](img/lab22-configMap-volume-pod.png)

We want to map the transporter.json file contents onto a file in the Container in the Pod.

(Part of) the Pods manifest file looks like below:

```bash
spec:
  containers:
  - image: some/image
    volumeMounts:
    - name: myconfigvolume
      mountPath: /etc/someconfig.json
      subPath: transporter.json
...

  volumes:
  - name: myconfigvolume
    configMap:
      name: myconfigmap
```

So, in the container, the *contents of the transporter.json key in myconfigmap* is mapped in the Container on the *file /etc/someconfig.json*.



## 22.2 Exercises

Well, the commands are in the above figures, and the sample files are in the `lab 22` directory. 

Just create a Pod with an `lgorissen/terra10` Container that has the config data as described above mounted. 

And ... clean up!
