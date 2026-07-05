import re

def patch_file(filepath, classes):
    with open(filepath, 'r') as f:
        content = f.read()

    for cls in classes:
        # Find the class definition
        class_regex = re.compile(rf"class {cls}\(.*?serializers.ModelSerializer\):")
        match = class_regex.search(content)
        if match:
            class_start = match.end()
            # Find the 'class Meta:' inside this class
            meta_regex = re.compile(r"(\s+class Meta:)")
            meta_match = meta_regex.search(content, class_start)
            
            if meta_match:
                # Add notified_users_emails field before Meta
                insertion = "\n    notified_users_emails = serializers.SerializerMethodField()\n"
                
                # Also add the method at the end of the class, or just after Meta.
                # Since the class might have other methods, it's safer to add the get_ method right after we find Meta.
                # Actually, adding the method after `fields = '__all__'` or similar.
                meta_block_end = content.find('\n', content.find('fields =', meta_match.end())) + 1
                method_insertion = "\n    def get_notified_users_emails(self, obj):\n        if hasattr(obj, 'notified_users'):\n            return list(obj.notified_users.values_list('email', flat=True))\n        return []\n"
                
                content = content[:meta_match.start()] + insertion + content[meta_match.start():meta_block_end] + method_insertion + content[meta_block_end:]

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('ktbv2/trademgt/serializers.py', [
    'TradeSerializer',
    'PreSalePurchaseSerializer',
    'PrePaymentSerializer',
    'SalesPurchaseSerializer',
    'PaymentFinanceSerializer'
])

patch_file('ktbv2/costmgt/serializers.py', [
    'RawMaterialSerializer',
    'AdditiveSerializer',
    'PackingSerializer',
    'ConsumptionSerializer',
    'ConsumptionFormulaSerializer',
    'ProductFormulaSerializer',
    'FinalProductSerializer'
])
print("Done patching serializers")
