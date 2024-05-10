theme: /
    state: ПрочтиАнекдот
        q!: (прочитай | озвучь | расскажи) анекдот
        
        a: {{get_text(get_request($context))}}