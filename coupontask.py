from matplotlib import pyplot as plt
import pandas as pd
import json
import math
 
f = open('coupons.json')
data = json.load(f)

resultObj = {}

def paintPlot(data, title, x, y, chartType):
    data.plot(kind=chartType)
    plt.xlabel(x or '') 
    plt.ylabel(y or '')
    plt.title(title or '')
    plt.xticks(rotation=45, ha='right')
    plt.show()


# creates dicitionary with info from the dataframe
def createDict(data,mainKey,secondaryKey, value):
    nested_dict = {}
    for _,row in data.iterrows():
        if row[mainKey] not in nested_dict:
            nested_dict[row[mainKey]] = {}

        val = row[value]
        nested_dict[row[mainKey]][row[secondaryKey]] =  0 if val is None or math.isnan(val) else val 
    return nested_dict
 


df = pd.DataFrame(data['coupons'])


per_store = df['webshop_id'].value_counts()
resultObj['totalCouponsPerStore'] =  per_store.to_dict()
paintPlot(per_store , 'Count by type', 'type', 'count','bar')

per_type = df['promotion_type'].value_counts(dropna=False)
paintPlot(per_type , 'Count by type', 'type', 'count','bar')
resultObj['per_type'] =  per_type.to_dict()



promotiontype_per_store = df.groupby(by=["webshop_id"])['promotion_type'].value_counts(dropna=False)
group = df.groupby(by=["webshop_id"])['promotion_type'].value_counts(dropna=False).reset_index(name='count')

nested_dict = createDict(group,'webshop_id','promotion_type','count')


resultObj['types_per_store'] = nested_dict

groupedByStoreType = df.groupby(by=["webshop_id","promotion_type"])

# store_and_tipe_values = groupedByStoreType.agg({'value': ['mean', 'min', 'max']}).reset_index()
# print(store_and_tipe_values.groupby(by="webshop_id"))

store_MAX = groupedByStoreType['value'].max().reset_index()
store_MIN = groupedByStoreType['value'].min().reset_index()
store_MEAN = groupedByStoreType['value'].mean().reset_index()

nested_dict = nested_dict = createDict(store_MAX,'webshop_id','promotion_type','value')
resultObj['max_values_per_type'] = nested_dict

nested_dict = nested_dict = createDict(store_MIN,'webshop_id','promotion_type','value')
resultObj['lowest_val_per_type'] = nested_dict

nested_dict = nested_dict = createDict(store_MEAN,'webshop_id','promotion_type','value')
resultObj['mean_value_per_type'] = nested_dict


info = df.groupby(by=["webshop_id","promotion_type"])['first_seen'].min()
print(info)



jsresultObjjon = json.dumps(resultObj)
with open("results.json", "w") as outfile:
    outfile.write(jsresultObjjon)
